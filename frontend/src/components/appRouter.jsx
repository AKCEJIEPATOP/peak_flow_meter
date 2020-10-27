import React, { useEffect } from 'react';
import { Redirect, Route, Switch } from 'react-router';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import Main from './main';
import { LogIn, Registration } from './user';
import Status from '../consts/status';
import Actions from '../redux/user/actions';

function AppRouter({ profileStatus, checkToken, loginStatus, profile }) {

  useEffect(() => {
    checkToken();
  }, [checkToken]);

  switch (loginStatus) {
    case Status.NONE:
      return <span>Инициализация</span>;

    case Status.SUCCESS:
      break;

    default:
      return (
        <Switch>
          <Route path="/login" component={LogIn} />
          <Route path="/registration" component={Registration} />
          <Route component={() => <Redirect to="/login" />} />
        </Switch>
      );
  }

  switch (profileStatus) {
    case Status.NONE:
      return <span>Подготовка запроса профиля</span>;

    case Status.PENDING:
      return <span>Запрос профиля</span>;

    case Status.FAILURE:
      return <span>Ошибка при запросе профиля</span>;

    case Status.SUCCESS:
      break;

    default:
      throw Error('WTF error');
  }

  const { id } = profile;
  return (
    <Switch>
      <Route path={`/user/${id}`} component={Main} />
      <Route component={() => <Redirect to={`/user/${id}`} /> } />
    </Switch>
  );
}

AppRouter.propTypes = {
  profileStatus: PropTypes.string.isRequired,
  loginStatus: PropTypes.string.isRequired,
  checkToken: PropTypes.func.isRequired,
};

const mapStateToProps = (state) => {
  const { user } = state;
  const { profileStatus, logIn, profile } = user;
  const { status: loginStatus } = logIn;
  return { profileStatus, loginStatus, profile };
};

const mapDispatchToProps = (dispatch) => ({
  checkToken: () => dispatch(Actions.checkToken()),
});

export default connect(mapStateToProps, mapDispatchToProps)(AppRouter);
