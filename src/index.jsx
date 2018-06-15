import {createStore, applyMiddleware, compose} from 'redux'
import React from 'react'
import {Provider, connect} from 'react-redux'
import ReactDOM from 'react-dom'
import { actionStorageMiddleware, createStorageListener } from 'redux-state-sync';
import PropTypes from 'prop-types'
import persistState from 'redux-localstorage'
import * as R from 'ramda'

import GoldenLayout from 'golden-layout'

window.ReactDOM = ReactDOM
window.React= React


const initialState = {
  count: 0
}

function reducers(state = initialState, action) {
  switch(action.type) {
    case "INC":
        return R.assoc('count', state.count + 1, state)
    case "DEC":
        return R.assoc('count', state.count - 1, state)
    default:
      return state;
  }
}

const enhancers = compose(applyMiddleware(actionStorageMiddleware), persistState())

const store = createStore(
  reducers,
  window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__(),
  enhancers
)
createStorageListener(store)

function incButton({increment}) {
  return <button onClick={increment}>+</button>
}

const IncButton = connect(
  () => ({}),
  (dispatch) => ({increment: () => dispatch({type: 'INC'})})
)(incButton)



function decButton({decrement}) {
  return <button onClick={decrement}>-</button>
}

const DecButton = connect(
  () => ({}),
  (dispatch) => ({decrement: () => dispatch({type: 'DEC'})})
)(decButton)


function counter({count}) {
  return <span>{count}</span>
}

const Counter = connect(
  (state, ownProps) => ({count: state.count}),
  () => ({})
)(counter)

// GOLDEN LAYOUT STUFF

class GlWrapper extends React.Component {
  componentDidMount() {
    const myLayout = new GoldenLayout({
      content: [{
        type: 'row',
        content:[{
          type:'react-component',
          component: 'dec-component',
        }, {
          type:'react-component',
          component: 'counter-component',
        }, {
          type:'react-component',
          component: 'inc-component',
        }]
      }]
    }, document.getElementById('GL'));

    function wrapComponent(Component, store) {
      class Wrapped extends React.Component {
        render() {
          return (
              <Provider store={store}>
                <Component {...this.props}/>
              </Provider>
          );
        }
      }
      return Wrapped;
    };

    myLayout.registerComponent('counter-component', wrapComponent(Counter, this.context.store))
    myLayout.registerComponent('inc-component', wrapComponent(IncButton, this.context.store))
    myLayout.registerComponent('dec-component', wrapComponent(DecButton, this.context.store))

    myLayout.init()
  }
  render() {
    return <div id="GL" style={{height:'500px',width:'500px'}}></div>
  }
}
GlWrapper.contextTypes = {
  store: PropTypes.object.isRequired
};


ReactDOM.render(<Provider store={store}><GlWrapper/></Provider>, document.getElementById('app'))


