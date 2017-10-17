import React, { Component } from 'react';
import ReactPlayer from 'react-player';
import fetch from 'node-fetch'

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
    padding: 5, paddingLeft: 15, paddingRight: 15,
    backgroundColor: "white",
    outline: "none",
    borderWidth: 1, borderColor: "rgba(0, 0, 0, .2)", borderStyle: "solid",
    borderRadius: 2
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
      links: [],
      found: {}
    }
  }
  componentDidMount() {
    fetchLinks(this.state.listkey)
      .then((links) => this.setState({ loading: false, links }))
      .catch(err => {
        this.setState({ loading: false });
      })
  }
  changeList(keyword) {
    this.setState({ loading: true, links: [], time: 0, track: 0, listkey: keyword }, () => {
      fetchLinks(keyword)
        .then(links => this.setState({ loading: false, links }))
        .catch(err => {
          this.setState({ loading: false });
        })
    })
  }
  onProgress(index, playedTime) {
    let found = this.state.found;
    found[String(index)] = false;
    this.setState({ time: playedTime, found })
  }
  onEnded(lastIndex) {
    const track = this.state.track;
    this.start(track + 1)
  }
  start(startIndex) {
    this.setState({ track: startIndex, time: 0 })
  }
  render() {
    return (
      <div style={{ display: "flex", flexDirection: "column", padding: 10 }}>
        <div style={{ display: "flex" }}>
          <button style={Object.assign({}, buttonStandard(), { marginRight: 10, backgroundColor: this.state.listkey === 'hot' ? 'rgba(0, 0, 0, .12)' : "white" })} onClick={() => this.changeList('hot')}>Hot</button>
          <button style={Object.assign({}, buttonStandard(), { marginRight: 10, backgroundColor: this.state.listkey === 'top' ? 'rgba(0, 0, 0, .12)' : "white" })} onClick={() => this.changeList('top')}>Top</button>
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
                      <ReactPlayer fileConfig={{ attributes: { autoPlay: true }}} width={'100%'} onEnded={() => this.onEnded(i)} onStart={() => this.start(i)} onProgress={({ played }) => this.onProgress(i, played)} url={url} controls playing={this.state.track === i ? true : false} />
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
