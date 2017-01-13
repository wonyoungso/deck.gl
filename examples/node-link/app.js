/* global document, window*/
import 'babel-polyfill';

import React, {Component} from 'react';
import {render} from 'react-dom';
import DeckGL from 'deck.gl/react';
import {ScatterplotLayer, LineLayer} from 'deck.gl';
import PerspectiveViewport from 'viewport-mercator-project/perspective';

const NUM_NODES = 100;
const NUM_EDGES = 200;

class Root extends Component {

  constructor(props) {
    super(props);

    const nodes = this._getNodes();
    const edges = this._getEdges(nodes);

    this.state = {
      viewport: {},
      width: 0,
      height: 0,
      nodes,
      edges
    };
  }

  componentWillMount() {
    window.addEventListener('resize', this._onResize.bind(this));
    this._onResize();
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this._onResize.bind(this));
  }

  _onResize() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    this.setState({
      width,
      height,
      viewport: new PerspectiveViewport({
        width,
        height,
        longitude: 0,
        latitude: 0,
        zoom: 0
      })
    });
  }

  _getNodes() {
    return Array.from({length: NUM_NODES}, () => [
      Math.random() * 2 - 1,
      Math.random() * 2 - 1
    ]);
  }

  _getEdges(nodes) {
    return Array.from({length: NUM_EDGES}, () => {
      const sourceId = Math.floor(Math.random() * NUM_NODES);
      const targetId = Math.floor(Math.random() * NUM_NODES);
      return [nodes[sourceId], nodes[targetId]];
    });
  }

  render() {
    const {viewport, width, height, nodes, edges} = this.state;
    if (width <= 0 || height <= 0 || !nodes || !nodes.length) {
      return null;
    }

    const dx = width / 2;
    const dy = height / 2;

    const layers = [
      new LineLayer({
        id: 'edge-layer',
        projectionMode: 0,
        getSourcePosition: d => [d[0][0] * dx, d[0][1] * dy],
        getTargetPosition: d => [d[1][0] * dx, d[1][1] * dy],
        getColor: x => [200, 200, 200],
        data: edges
      }),
      new ScatterplotLayer({
        id: 'node-layer',
        projectionMode: 0,
        getPosition: d => [d[0] * dx, d[1] * dy],
        getRadius: d => 1,
        getColor: d => [0, 128, 128],
        data: nodes,
        // there's a bug that the radius calculated with project_scale
        radiusMinPixels: 3
      })

    ];

    return (
      <DeckGL
        {...viewport}
        width={width}
        height={height}
        layers={layers}
        debug />
    );
  }

}

const root = document.createElement('div');
document.body.appendChild(root);

render(<Root />, root);
