// @flow
import {hot} from 'react-hot-loader/root'
import * as RouteTreeGen from '../actions/route-tree-gen'
import * as React from 'react'
import RouterSwitcheroo from '../router-v2/switcheroo'
import {connect} from '../util/container'
import {type RouteDefNode, type RouteStateNode, type Path} from '../route-tree'
// Uncomment to get more info on hot loading
// import {setConfig} from 'react-hot-loader'
// setConfig({logLevel: 'debug'})

type OwnProps = any // the types here and RouteProps don't agree

type Props = {
  widgetBadge: boolean,
  desktopAppBadgeCount: number,
  username: string,
  navigateUp: () => void,
  routeDef: RouteDefNode,
  routeState: RouteStateNode,
  setRouteState: (path: Path, partialState: {}) => void,
  useNewRouter: boolean,
}

class Main extends React.PureComponent<Props> {
  render() {
    return (
      <RouterSwitcheroo
        useNewRouter={this.props.useNewRouter}
        oldRouteDef={this.props.routeDef}
        oldRouteState={this.props.routeState}
        oldSetRouteState={this.props.setRouteState}
      />
    )
  }
}

const mapStateToProps = state => ({
  routeDef: state.routeTree.routeDef,
  routeState: state.routeTree.routeState,
  useNewRouter: state.config.useNewRouter,
  username: state.config.username,
})

const mapDispatchToProps = dispatch => ({
  navigateUp: () => dispatch(RouteTreeGen.createNavigateUp()),
  setRouteState: (path, partialState) => {
    dispatch(RouteTreeGen.createSetRouteState({partialState, path}))
  },
})

export default hot(
  connect<OwnProps, _, _, _, _>(
    mapStateToProps,
    mapDispatchToProps,
    (s, d, o) => ({...o, ...s, ...d})
  )(Main)
)
