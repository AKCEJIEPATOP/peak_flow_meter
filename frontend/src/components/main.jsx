import React, {createRef, useEffect, useState} from 'react';
import {connect} from 'react-redux';
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
  const [drawMean, setDrawMean] = useState(true);
  const [drawExtrapolation, setDrawExtrapolation] = useState(true);
  const [drawValues, setDrawValues] = useState(true);
  const [drawDividers, setDrawDividers] = useState(false);

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
    const {
      normal_threshold, warning_threshold, measurements, sl_mean, extra, daily_stats,
    } = profile;

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
      daily_stats: daily_stats,
    };
    measurements.forEach((measurement) => {
      data.x.push(measurement.time);
      data.y.push(measurement.value);
    });

    const drawGraph = (data) => {
      const cnv = canvas.current;
      const context = cnv.getContext('2d');
      const { width, height } = context.canvas;

      // const minX = Math.min(...data.x);
      // const maxX = Math.max(...[...data.x, ...data.extra.x]);
      const timestamps = [];
      Object.keys(daily_stats).forEach((k) => {
        const { day_start, day_end } = daily_stats[k];
        timestamps.push(day_start, day_end);
      });

      const minX = Math.min(...timestamps);
      const maxX = Math.max(...data.extra.x);

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

      const clear = () => {
        context.fillStyle = 'white';
        context.fillRect(0, 0, width, height);
      };
      clear();

      const drawPoint = (xv, yv, color) => {
        context.lineWidth = 1;
        context.strokeStyle = color;
        context.fillStyle = color;
        context.beginPath();
        context.arc(x(xv), y(yv), 5, 0, 2 * Math.PI);
        context.fill();
        context.stroke();
      };

      const drawLine = (x1, y1, x2, y2, lineWidth, color) => {
        context.lineWidth = lineWidth;
        context.strokeStyle = color;
        context.beginPath();
        context.moveTo(x1, y1);
        context.lineTo(x2, y2);
        context.stroke();
      };

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

        for (let i = 0; i < xv.length; i++) {
          drawPoint(xv[i], yv[i], color);
        }

      };

      const drawText = (xv, yv, text, color) => {
        context.fillStyle = color;
        context.font = '20px serif';
        context.fillText(text, xv ,yv);
      };

      const drawZones = () => {

        context.fillStyle = '#FF0000';
        context.fillRect(0, height, width, - height);

        context.fillStyle = '#FFFF00';
        context.fillRect(0, height, width, - scaleY * data.thresholds.warning);

        context.fillStyle = '#00FF00';
        context.fillRect(0, height, width, - scaleY * data.thresholds.ok);
      };
      // drawZones();

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
      // drawAxes();

      const drawDays = (stats) => {
        Object.keys(stats).forEach((k) => {
          const {
            day_start, day_end, morning, evening, percentage,
          } = stats[k];

          context.fillStyle = (percentage ? '#afdfa7' : '#d9d9d9');
          context.fillRect(x(day_start), 0, x(day_end)- x(day_start), height);

          if (drawDividers) {
            const middleX = (x(day_end) + x(day_start)) / 2;
            drawLine(middleX, 0, middleX, height, 1, 'black');
            drawLine(x(day_end), 0, x(day_end), height, 3, 'black');
          }

          if (morning) {
            drawPoint(day_start + 6 * 3600 * 1000, morning, 'yellow');
          }
          if (evening) {
            drawPoint(day_start + 18 * 3600 * 1000, evening, 'yellow');
          }

          const text = k.split('.');
          drawText(x(day_start) + 10, height - 10, `${text[0]}.${text[1]}`, 'black');
        });
      };
      drawDays(daily_stats);


      if (drawValues) {
        drawArray(data.x, data.y, 'black');
      }
      if (drawMean) {
        drawArray(data.x, data.average, 'purple');
      }
      if (drawExtrapolation) {
        drawArray(data.extra.x, data.extra.y, 'red');
      }
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
        <div className='controls'>
          {/*<div className="inputField">*/}
          {/*  Интервал сетки:*/}
          {/*  <input*/}
          {/*    type="text"*/}
          {/*    value={rawGridScale.toString()}*/}
          {/*    onChange={(event) => onValueChange(event.target.value, setRawGridScale)}*/}
          {/*  />*/}
          {/*  <button onClick={setGrid}>Установить</button>*/}
          {/*</div>*/}
          <div className="inputField">
            Добавить измерение:
            <input
              type="text"
              onChange={(event) => onValueChange(event.target.value, setMeasurement)}
              value={measurement.toString()}
            />
            <button onClick={() => addMeasurement(measurement)}>Отправить</button>
          </div>
          <div>
            <input
              type='checkbox'
              checked={drawMean}
              onChange={(e) => setDrawMean(e.target.checked)}
            />
            <span>Отображать среднее</span>
          </div>
          <div>
            <input
              type='checkbox'
              checked={drawExtrapolation}
              onChange={(e) => setDrawExtrapolation(e.target.checked)}
            />
            <span>Отображать предсказание</span>
          </div>
          <div>
            <input
              type='checkbox'
              checked={drawValues}
              onChange={(e) => setDrawValues(e.target.checked)}
            />
            <span>Отображать значения</span>
          </div>
          <div>
            <input
              type='checkbox'
              checked={drawDividers}
              onChange={(e) => setDrawDividers(e.target.checked)}
            />
            <span>Отображать разделители</span>
          </div>
        </div>
        <canvas ref={canvas} height={500} width={1000} />
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
    daily_stats: PropTypes.object.isRequired,
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
