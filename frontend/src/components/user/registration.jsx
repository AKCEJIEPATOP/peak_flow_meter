import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import Actions from '../../redux/user/actions';
import './registration.scss';

const Registration = ({register}) => {
  const [errorMessage, setErrorMessage] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');

  const setError = (text) => {
    setPassword('');
    setPasswordConfirmation('');
    setErrorMessage(text);
  };

  const registerUser = () => {
    if (!username) {
      setError('Введите имя пользователя');
      return;
    }
    if (!password) {
      setError('Введите пароль и его подтверждение');
      return;
    }
    if (password !== passwordConfirmation) {
      setError('Пароли должны совпадать');
      return;
    }

    register(username, password);
  };

  return (
    <div className="Registration">
      <span>Регистрация</span>
      {!errorMessage || <div className="ErrorMessage">{errorMessage}</div>}
      <label>
        Имя пользователя
        <input type="text" onChange={(e) => setUsername(e.target.value)} value={username} />
      </label>
      <label>
        Пароль
        <input type="password" onChange={(e) => setPassword(e.target.value)} value={password} />
      </label>
      <label>
        Подтвердите пароль
        <input
          type="password"
          onChange={(e) => setPasswordConfirmation(e.target.value)}
          value={passwordConfirmation}
        />
      </label>
      <button type="submit" onClick={registerUser}>Зарегистрироваться</button>
      <Link to="/login">Уже зарегистрированы?</Link>
    </div>
  );
};

Registration.propTypes = {
  register: PropTypes.func.isRequired,
};

const mapDispatchToProps = (dispatch) => ({
  register: (username, password) => dispatch(Actions.register(username, password)),
});

export default connect(null, mapDispatchToProps)(Registration);
