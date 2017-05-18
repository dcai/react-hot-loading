import { AppContainer } from 'react-hot-loader';
import ReactDOM from 'react-dom';
import React from 'react';
import App from './app.jsx';

const render = Component => {
    ReactDOM.render(
        <AppContainer>
            <Component />
        </AppContainer>,
        document.getElementById('app')
    );
};

render(App);

if (module.hot) {
    module.hot.accept('./app.jsx', () => render(App));
}
