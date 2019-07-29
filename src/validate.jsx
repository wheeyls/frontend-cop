import debounce from 'debounce';
import { waitForGlobal } from './waitForGlobal';
import { h, render, Component } from 'preact';
import { createStore } from 'redux';

/** @jsx h */

function frontendApp(state, action) {
  if (action.type === 'INVALID_IMGS') {
    return { items: action.items };
  }
}

const app = createStore(frontendApp);

const style = `<style>
  .frontend-cop {
    background: white;
    position: fixed;
    left: 0;
    bottom: 0;
  }

  .frontend-cop__close {
    padding: 0 8px;
    display: block;
    color: white;
    background-color: gray;
    text-align: center;
  }

  .frontend-cop__close:hover {
    color: white;
    font-weight: 400;
  }

  .frontend-cop--collapsed ul {
    display: none;
  }

  .frontend-cop__list {
    list-style-type: none;
    margin: 0;
    padding: 8px;
  }

  .frontend-cop-violation {
    box-shadow: 0px 0px 0px 10px red;
  }
</style>`;

function createStyles($) {
  $('head').append(style);
}

function validateImgs(imgs) {
  return imgs.filter(function(i) {
    i.className = i.className.replace(
      ' frontend-cop-violation frontend-cop-violation--img-size',
      ''
    );
    if (!i.src.match(/\.svg/) && i.naturalWidth > i.clientWidth * 2) {
      i.className += ' frontend-cop-violation frontend-cop-violation--img-size';
      return true;
    }
  });
}

function validateAll(document, store = app) {
  let results = validateImgs(Array.from(document.querySelectorAll('img')));
  store.dispatch({
    type: 'INVALID_IMGS',
    items: results
  });

  return results;
}

function watch(store = app) {
  waitForGlobal('$', function($) {
    list({ badImgs: validateAll(document), container: document.body });
    createStyles($);
    $(window).on(
      'resize',
      debounce(
        () =>
          store.dispatch({
            type: 'INVALID_IMGS',
            items: validateAll(document)
          }),
        1000
      )
    );
    $(window).on(
      'pjax:end',
      debounce(
        () =>
          store.dispatch({
            type: 'INVALID_IMGS',
            items: validateAll(document)
          }),
        1000
      )
    );
  });
}

class List extends Component {
  constructor(props) {
    super(props);

    this.state = { items: props.items || [] };
    props.store.subscribe(() => this.setState(props.store.getState()));
  }

  toggleCollapsed() {
    this.setState({ collapsed: !this.state.collapsed });
  }

  render() {
    let items = this.state.items.map(function(i) {
      return (
        <li key={i.src}>
          <a
            href="#"
            onClick={e => {
              e.preventDefault();
              console.log('frontend-cop', i);
              i.scrollIntoView();
            }}
          >
            Image size of {i.naturalWidth} too large for container size of{' '}
            {i.clientWidth}
          </a>
        </li>
      );
    });
    return (
      <div
        className={
          'frontend-cop' +
          (this.state.collapsed ? ' frontend-cop--collapsed' : '')
        }
      >
        <a
          className="frontend-cop__close"
          onClick={() => this.toggleCollapsed()}
        >{ this.state.collapsed ? '>' : '<' }</a>
        <ul className="frontend-cop__list">{items}</ul>
      </div>
    );
  }
}

function list({ badImgs, container, store = app } = {}) {
  let component = <List items={badImgs} store={store} />;
  return render(component, container);
}

function panel() {}

export { validateImgs, validateAll, watch, list, app };
