import React, { Component } from 'react';
import ReactPlayer from 'react-player';
import fetch from 'node-fetch';
import Forwards from 'react-icons/lib/md/arrow-forward';
import Backwards from 'react-icons/lib/md/arrow-back';

const openInTab = (url) => {
  var win = window.open(url, '_blank');
  win.focus();
};

const fetchLinks = (keyword) => {
  return new Promise((resolve, reject) => {
    const jsonUri = `https://www.reddit.com/r/listentothis/${keyword}/.json`;
    fetch(jsonUri)
      .then((res) => res.json())
      .then((json) => resolve(json.data.children.map(child => ({ url: child.data.url, title: child.data.title }))))
      .catch(err => reject(err))
  })
};
const buttonStandard = () => {
  return {
    cursor: "pointer",
    margin: 0,
    display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
    height: 30, width: 60,
    backgroundColor: "white",
    outline: "none",
    borderWidth: 0,
    borderRadius: 2,
    color: "white"
  }
};
const circleButtonStandard = () => {
  return {
    cursor: "pointer",
    margin: 0,
    height: 50, width: 50,
    backgroundColor: "white",
    borderWidth: 1, borderColor: "rgba(0, 0, 0, .2)", borderStyle: "solid",
    borderRadius: 25
  }
};
class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      listkey: 'hot',
      track: 0,
      time: 0,
      links: []
    }
  }
  componentDidMount() {
    const state = this.stateCache();
    if (state) {
      this.setState(state)
    } else {
      this.stateLoader('hot')
    }
    this.handleKeyboardEvents()
  }
  handleKeyboardEvents() {
    document.addEventListener('keydown', (event) => {
      const keyName = event.key;
      if (keyName === 'Control') {
        return;
      }
      if (keyName === 'ArrowRight') {
        this.start(this.state.track + 1)
        return
      }
      if (keyName === 'ArrowLeft') {
        this.start(this.state.track - 1)
        return
      }
    }, false);
  }
  stateCache() {
    let cachedStateString = window.localStorage.getItem('player-state');
    let cachedState = cachedStateString ? JSON.parse(cachedStateString) : null;
    let shouldFetch = false;
    if (!cachedState) {
      shouldFetch = true
    }
    if (cachedState && (new Date(cachedState.timestamp).getTime() < (new Date().getTime() - 3600000000000))) {
      shouldFetch = true
    }
    if (!shouldFetch) {
      return cachedState.state
    } else {
      return null
    }
  }
  stateLoader(keyword) {
    window.scrollTo(0, 0);
    this.setState({ loading: true, links: [], time: 0, track: 0, listkey: keyword }, () => {
      fetchLinks(keyword)
        .then(links => this.setState({ loading: false, links }))
        .catch(err => this.setState({ loading: false }))
    })
  }
  onProgress(index, playedTime) {
    this.setState({ time: playedTime }, () => this.cacheState())
  }
  cacheState() {
    window.localStorage.setItem('player-state', JSON.stringify({ timestamp: new Date().toString(), state: this.state }))
  }
  onEnded(lastIndex) {
    const track = this.state.track;
    this.start(track + 1)
  }
  start(startIndex) {
    const saveTrackIndex = this.state.track;
    this.setState({ track: startIndex, time: 0 })
  }
  render() {
    const leftColor = 'rgb(33,150,243)';
    const rightColor = 'rgb(33,150,243)';
    const unselectedTabColor = 'rgb(227,242,253)';
    const selectedTabColor = 'rgb(33,150,243)';
    return (
      <div style={{ display: "flex", flexDirection: "column", padding: 10, paddingTop: 40 }}>
        <div style={{ display: "flex", justifyContent: "space-between", position: "fixed", top: 0, left: 0, backgroundColor: "white", width: "100%", borderWidth: 0, borderBottomWidth: 1, borderColor: "rgba(0, 0, 0, .1)", borderStyle: "solid", boxShadow: "3px 3px 4px rgba(0, 0, 0, .1)" }}>
          <div style={{ display: "flex", margin: 10, marginLeft: 20 }}>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <button style={Object.assign({}, buttonStandard(), { marginRight: 10, backgroundColor: this.state.listkey === 'hot' ? selectedTabColor : unselectedTabColor, color: this.state.listkey === 'hot' ? unselectedTabColor : selectedTabColor })} onClick={() => this.stateLoader('hot')}>
                <div style={{ display: "flex", flex: 1, alignItems: "center", justifyContent: "center" }}>
                  <p style={{ color: "white" }}>Hot</p>
                </div>
              </button>
            </div>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <button style={Object.assign({}, buttonStandard(), { marginRight: 10, backgroundColor: this.state.listkey === 'top' ? selectedTabColor : unselectedTabColor, color: this.state.listkey === 'top' ? selectedTabColor : unselectedTabColor })} onClick={() => this.stateLoader('top')}>
                <div style={{ display: "flex", flex: 1, alignItems: "center", justifyContent: "center" }}>
                  <p style={{ color: "white" }}>Top</p>
                </div>
              </button>
            </div>
          </div>
          <div style={{ display: "flex", margin: 10, marginRight: 20 }}>
            <button onClick={() => this.start(this.state.track - 1)} style={Object.assign({}, buttonStandard(), { color: "white", borderWidth: 0,backgroundColor: leftColor })}>
              <div style={{ display: "flex", flex: 1, alignItems: "center", justifyContent: "center" }}>
                <Backwards size={15} />
              </div>
            </button>
            <button onClick={() => this.start(this.state.track + 1)} style={Object.assign({}, buttonStandard(), { marginLeft: 15, color: "white", borderWidth: 0,backgroundColor: rightColor })}>
              <div style={{ display: "flex", flex: 1, alignItems: "center", justifyContent: "center" }}>
                <Forwards size={15} />
              </div>
            </button>
          </div>
        </div>
        {
          this.state.loading ?
            null
            :
            this.state.links.filter(link => !link.url.includes('reddit')).map(({ url, title }, i) => {
              if (url.includes('bandcamp')) {
                return(
                  <button onClick={() => openInTab(url)} style={{ cursor: "pointer", borderWidth: 0, borderColor: "transparent", backgroundColor: "transparent", display: "flex", flexDirection: "column", marginTop: 20 }}>
                    <h3 style={{ margin: 0, marginBottom: 5, marginTop: 5 }}>{title}</h3>
                    <div style={{ display: "flex" }}>
                      <p style={{ margin: 0 }}>{url}</p>
                    </div>
                  </button>
                )
              } else {
                if (this.state.track === i) {
                  return(
                    <div style={{ display: "flex", flexDirection: "column", marginTop: 20 }}>
                      <ReactPlayer
                        fileConfig={{ attributes: { autoPlay: true }}}
                        width={'100%'}
                        height={window.innerHeight - 200}
                        onEnded={() => this.onEnded(i)} onStart={() => this.start(i)} onProgress={({ playedSeconds }) => this.onProgress(i, playedSeconds)}
                        url={url}
                        controls
                        playing={this.state.track === i ? true : false}
                        youtubeConfig={{ playerVars: { start: Math.round(this.state.time), autoplay: 1 } }}/>
                    </div>
                  )
                } else {
                  return(
                    <button onClick={() => this.start(i)} style={{ cursor: "pointer", borderWidth: 0, borderColor: "transparent", backgroundColor: "transparent", display: "flex", flexDirection: "column", margin: 0, marginLeft: -5, marginTop: 20 }}>
                      <h3 style={{ textAlign: "left", margin: 0, marginBottom: 5, marginTop: 5 }}>{title}</h3>
                      <div style={{ display: "flex" }}>
                        <p style={{ textAlign: "left", margin: 0 }}>{url}</p>
                      </div>
                    </button>
                  )
                }
              }
            })
          }
      </div>
    );
  }
}

export default App;
