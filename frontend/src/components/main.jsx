import React, { createRef, useEffect, useState } from 'react';
import { connect } from 'react-redux';
import Actions from '../redux/user/actions';
import PropTypes from 'prop-types';
import './main.scss';

export const Main = (props) => {
  const {
    profile, addMeasurement, logOut,
  } = props;

  const canvas = createRef();

  const [measurement, setMeasurement] = useState(0);
  const [gridScale, setGridScale] = useState(20);
  const [rawGridScale, setRawGridScale] = useState(20);

  const onValueChange = (value, setter) => {
    if (value === '') {
      setter(0);
      return;
    }

    try {
      setter(parseInt(value, 10));
    } catch (e) {
      // no handling needed
    }
  };

  const setGrid = () => {
    if (rawGridScale >= 20) {
      setGridScale(rawGridScale);
    }
  };

  useEffect(() => {
    const { normal_threshold, warning_threshold, measurements, sl_mean, extra } = profile;

    const data = {
      thresholds: {
        ok: normal_threshold,
        warning: warning_threshold,
      },
      x: [],
      y: [],
      average: sl_mean,
      extra: {
        x: [measurements[measurements.length - 1].time, ...extra.map((i) => i.x)],
        y: [measurements[measurements.length - 1].value, ...extra.map((i) => i.y)],
      },
    };
    measurements.forEach((measurement) => {
      data.x.push(measurement.time);
      data.y.push(measurement.value);
    });

    const drawGraph = (data) => {
      const cnv = canvas.current;
      const context = cnv.getContext('2d');
      const { width, height } = context.canvas;

      const minX = Math.min(...data.x);
      const maxX = Math.max(...[...data.x, ...data.extra.x]);

      const maxY = Math.max(...data.y);

      const sizeX = maxX - minX;
      const sizeY = maxY;

      const minBorderX = minX - sizeX * 0.1;
      const maxBorderX = maxX + sizeX * 0.1;

      const minBorderY = 0;
      const maxBorderY = maxY + sizeY * 0.1;

      const scaleX = width / (maxBorderX - minBorderX);
      const scaleY = height / (maxBorderY - minBorderY);

      const x = (value) => (value - minBorderX) * scaleX;
      const y = (value) => height - (value * scaleY);

      const drawZones = () => {

        context.fillStyle = '#FF0000';
        context.fillRect(0, height, width, - height);

        context.fillStyle = '#FFFF00';
        context.fillRect(0, height, width, - scaleY * data.thresholds.warning);

        context.fillStyle = '#00FF00';
        context.fillRect(0, height, width, - scaleY * data.thresholds.ok);
      };
      drawZones();

      const drawAxes = () => {
        const division = gridScale;

        context.lineWidth = 1;
        context.strokeStyle = 'black';
        let axis = division;
        while (axis < maxBorderY) {
          context.beginPath();
          context.moveTo(0, y(axis));
          context.lineTo(width, y(axis));
          context.stroke();

          context.fillStyle = 'black';
          context.font = '20px serif';
          context.fillText(`${axis} pts`, 0, y(axis) + 20);

          axis += division;
        }

      };
      drawAxes();

      const drawArray = (xv, yv, color) => {
        if (xv.length !== yv.length) {
          throw Error('Data length error');
        }


        context.lineWidth = 3;
        context.strokeStyle = color;
        for (let i = 1; i < xv.length; i++) {
          context.beginPath();
          context.moveTo(x(xv[i - 1]), y(yv[i - 1]));
          context.lineTo(x(xv[i]), y(yv[i]));
          context.stroke();
        }

        context.fillStyle = color;
        for (let i = 0; i < xv.length; i++) {
          context.beginPath();
          context.arc(x(xv[i]), y(yv[i]), 5, 0, 2 * Math.PI);
          context.fill();
          context.stroke();
        }

      };

      drawArray(data.x, data.y, 'black');
      drawArray(data.x, data.average, 'purple');
      console.log(data.extra);
      drawArray(data.extra.x, data.extra.y, 'red');
    };
    drawGraph(data);
  }, [canvas, profile]);

  const { username, id } = profile;
  return (
    <div className="main">
      <div className="header">
        <span>{`${username} (${id})`}</span>
        <button onClick={logOut}>Выйти</button>
      </div>
      <div className="body">
        <div className="inputField">
          Интервал сетки:
          <input
            type="text"
            value={rawGridScale.toString()}
            onChange={(event) => onValueChange(event.target.value, setRawGridScale)}
          />
          <button onClick={setGrid}>Установить</button>
        </div>
        <canvas ref={canvas} height={500} width={1000} />
        <div className="inputField">
          Добавить измерение:
          <input
            type="text"
            onChange={(event) => onValueChange(event.target.value, setMeasurement)}
            value={measurement.toString()}
          />
          <button onClick={() => addMeasurement(measurement)}>Отправить</button>
        </div>
      </div>
    </div>
  );
};

Main.propTypes = {
  getProfile: PropTypes.func.isRequired,
  addMeasurement: PropTypes.func.isRequired,
  profile: PropTypes.shape({
    id: PropTypes.number.isRequired,
    username: PropTypes.string.isRequired,
    normal_threshold: PropTypes.number.isRequired,
    warning_threshold: PropTypes.number.isRequired,
    measurements: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.number.isRequired,
        time: PropTypes.number.isRequired,
        value: PropTypes.number.isRequired,
      })
    ).isRequired,
  }).isRequired,
};

const mapStateToProps = (state) => {
  const { user } = state;
  const { profile, profileStatus, profileError } = user;
  return { profile, profileStatus, profileError };
};

const mapDispatchToProps = (dispatch) => ({
  getProfile: () => dispatch(Actions.getProfile()),
  logOut: () => dispatch(Actions.logOut()),
  addMeasurement: (value) => dispatch(Actions.addMeasurement(value)),
});

export default connect(mapStateToProps, mapDispatchToProps)(Main);
