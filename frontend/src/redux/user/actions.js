import Types from './types';
import API from '../../api';

const getProfile = () => async (dispatch) => {
  dispatch({ type: Types.profile.REQUEST });
  try {
    const { data } = await API.User.getSelfInfo();
    dispatch({ type: Types.profile.SUCCESS, payload: data });
  } catch (err) {
    dispatch({ type: Types.profile.FAILURE, payload: err.message });
  }
};

const logIn = (username, password) => async (dispatch) => {
  if (!username) {
    dispatch({ type: Types.logIn.FAILURE, payload: 'Логин не должен быть пустым' });
    return;
  }
  if (!password) {
    dispatch({ type: Types.logIn.FAILURE, payload: 'Пароль не должен быть пустым' });
    return;
  }

  dispatch({ type: Types.logIn.REQUEST });
  try {
    const { data: { access_token: accessToken } } = await API.User.logIn(username, password);
    localStorage.setItem('token', accessToken);
    dispatch({ type: Types.logIn.SUCCESS });
    dispatch(getProfile());
  } catch (err) {
    dispatch({ type: Types.logIn.FAILURE, payload: err.message });
  }
};

const updateProfile = () => async (dispatch) => {
  try {
    const { data } = await API.User.getSelfInfo();
    dispatch({ type: Types.profile.SUCCESS, payload: data });
  } catch (err) {
    // no handling needed
  }
};

const checkToken = () => async (dispatch) => {
  if (localStorage.getItem('token')) {
    dispatch({ type: Types.logIn.SUCCESS });
    dispatch(getProfile());
  } else {
    dispatch({ type: Types.logIn.FAILURE, payload: '' });
  }
};

const addMeasurement = (value) => async (dispatch) => {
  dispatch({ type: Types.measurement.REQUEST });
  try {
    await API.User.addMeasurement(value);
    dispatch({ type: Types.measurement.SUCCESS });
    dispatch(updateProfile());
  } catch (err) {
    dispatch({ type: Types.measurement.FAILURE, payload: err.message });
  }
};

const logOut = () => async (dispatch) => {
  localStorage.removeItem('token');
  dispatch({ type: Types.logIn.FAILURE });
};

const register = (username, password) => async (dispatch) => {
  dispatch({ type: Types.registration.REQUEST });
  try {
    const { data: { access_token: accessToken } } = await API.User.register(username, password);
    localStorage.setItem('token', accessToken);
    dispatch({ type: Types.registration.SUCCESS });
    dispatch(getProfile());
  } catch (err) {
    dispatch({ type: Types.registration.FAILURE, payload: err.message });
  }
};

export default {
  logIn, getProfile, addMeasurement, checkToken, logOut, register,
};
