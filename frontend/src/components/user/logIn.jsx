import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import './logIn.scss';
import { connect } from 'react-redux';
import Actions from '../../redux/user/actions';
import letiLogo from '../../images/leti_logo.png';

function LogIn({ logIn, errorMessage }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const loginHandler = () => {
    const pass = password;
    setPassword('');
    logIn(username, pass);
  };

  return (
    <div className="LogIn">
      <img src={letiLogo} alt="logo" />
      { errorMessage && <div className="error">{ errorMessage }</div> }
      <input
        type="text"
        onChange={(e) => setUsername(e.target.value)}
        value={username}
        placeholder={'Логин'}
      />
      <input
        type="password"
        onChange={(e) => setPassword(e.target.value)}
        value={password}
        placeholder={'Пароль'}
      />
      <button type="submit" onClick={loginHandler}>Войти</button>
      <div>
        Нет аккаунта? <Link to="/registration">Зарегистрироваться</Link>
      </div>
    </div>
  );
}

const mapStateToProps = (state) => {
  const { user } = state;
  const { logIn } = user;
  const { errorMessage } = logIn;
  return { errorMessage };
};

const mapDispatchToProps = (dispatch) => ({
  logIn: (username, password) => dispatch(Actions.logIn(username, password)),
});

LogIn.propTypes = {
  logIn: PropTypes.func.isRequired,
  errorMessage: PropTypes.string.isRequired,
};

export default connect(mapStateToProps, mapDispatchToProps)(LogIn);
