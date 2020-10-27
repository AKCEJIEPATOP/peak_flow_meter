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
    const { normal_threshold, warning_threshold, measurements } = profile;

    const data = {
      thresholds: {
        ok: normal_threshold,
        warning: warning_threshold,
      },
      x: [],
      y: [],
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
      const maxX = Math.max(...data.x);

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

      const drawPoints = () => {
        for (let i = 0; i < data.x.length; i++) {

          context.beginPath();
          context.arc(x(data.x[i]), y(data.y[i]), 5, 0, 2 * Math.PI);
          context.fillStyle = 'black';
          context.fill();
          context.stroke();

          if (i !== 0) {
            context.beginPath();
            context.moveTo(x(data.x[i - 1]), y(data.y[i - 1]));
            context.lineTo(x(data.x[i]), y(data.y[i]));
            context.stroke();
          }
        }
      };
      drawPoints();
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
