import Status from '../../consts/status';
import Types from './types';

const initialState = {
  registration: {
    status: Status.NONE,
    errorMessage: '',
  },
  logIn: {
    status: Status.NONE,
    errorMessage: '',
  },
  profileStatus: Status.NONE,
  profileError: '',
  profile: null,
  measurement: {
    status: Status.NONE,
    errorMessage: '',
  },
};

const userReducer = (state = initialState, action) => {
  switch (action.type) {
    case Types.registration.REQUEST:
      return {
        ...state,
        registration: {
          ...state.registration,
          status: Status.PENDING,
        },
      };

    case Types.registration.FAILURE:
      return {
        ...state,
        registration: {
          ...state.registration,
          status: Status.FAILURE,
          errorMessage: action.payload,
        },
      };

    case Types.registration.SUCCESS:
      return {
        ...state,
        logIn: {
          ...state.logIn,
          status: Status.SUCCESS,
        },
        registration: {
          ...state.registration,
          status: Status.SUCCESS,
        },
      };

    case Types.logIn.REQUEST:
      return {
        ...state,
        logIn: {
          ...state.logIn,
          loginStatus: Status.PENDING,
        },
      };

    case Types.logIn.SUCCESS:
      return {
        ...state,
        logIn: {
          ...state.logIn,
          status: Status.SUCCESS,
        },
      };

    case Types.logIn.FAILURE:
      return {
        ...state,
        logIn: {
          ...state.logIn,
          status: Status.FAILURE,
          errorMessage: action.payload,
        },
      };

    case Types.profile.REQUEST:
      return {
        ...state,
        profileStatus: Status.PENDING,
        profile: null,
      };

    case Types.profile.FAILURE:
      return {
        ...state,
        logIn: {
          ...state.logIn,
          status: Status.FAILURE,
        },
        profileStatus: Status.FAILURE,
        profileError: action.payload,
      };

    case Types.profile.SUCCESS:
      return {
        ...state,
        profileStatus: Status.SUCCESS,
        profile: action.payload,
      };

    case Types.measurement.REQUEST:
      return {
        ...state,
        measurement: {
          ...state.measurement,
          status: Status.REQUEST,
        },
      };

    case Types.measurement.FAILURE:
      return {
        ...state,
        measurement: {
          ...state.measurement,
          status: Status.FAILURE,
          errorMessage: action.payload,
        },
      };

    case Types.measurement.SUCCESS:
      return {
        ...state,
        measurement: {
          ...state.measurement,
          status: Status.SUCCESS,
        },
      };

    default:
      return state;
  }
};

export default userReducer;
