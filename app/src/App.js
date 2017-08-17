import React, {Component} from 'react';
import PropTypes from 'prop-types';
import logo from './logo.svg';
import {createStore} from 'redux';
import moment from "moment";
import Script from 'react-load-script';
import URLSearchParams from 'url-search-params';
import localStorage from 'localStorage';

import './App.css';
import './user-info.css';
import './tweet.css';
import './responsive.css';

function userToDo(state = 0, action) {
  switch (action.type) {
    case "SHOW":
      return {user: action.user, tweets: action.tweets};
  }
}
let store = createStore(userToDo);

// Declare default values here
class Global {
  constructor() {
    this.apiGate = "http://127.0.0.1:3000";
    this.me = this.apiGate + "/connect/{0}";
    this.tweets = this.apiGate + "/tweets/{0}";
    this.removeTweet = this.apiGate + "/tweets/delete/{0}";
  }
}

// Show user information if necessary
class UserInfo extends Component {
  constructor(props) {
    super(props);
    var self = this;
    this.global = new Global();
    this.state = {
      user: null,
      tweets: []
    }

    // Clear all storage and cookies
    this.logout = function (id) {
      this.global = new Global();
      fetch(this.global.removeTweet.replace("{0}", id)).then(function (deleteResonse) {
        return deleteResonse.json();
      })
        .then(function (recordAfterDeleting) {
          if (recordAfterDeleting.ok === 1) {
            localStorage.clear();
            window.location.href = window.location.origin;
          }
        });
    };

    this.extendedEntities = function (extended_entities) {
      if (extended_entities) {
        this.imgHTML = extended_entities
          .media
          .map(function (img) {
            return (<img key={img.id_str} src={img.media_url} className="tweet-img"/>)
          });
        return this.imgHTML;
      }
    }

    this.tweetLikeURL = function (id) {
      return "https://twitter.com/intent/like?tweet_id=" + id;
    }

    this.timeFormat = function (time) {
      return moment
        .utc(time)
        .fromNow();
    }

    this.createTweet = function () {
      var tweetHTML = this
        .state
        .tweets
        .map(function (item) {
          return (
            <div className="tweet" key={item.id_str}>
              <img className="avatar" src={item.user.profile_image_url}/>
              <div className="tweet-content">
                <div>
                  <span className="name">{item.user.name}</span>
                  <span className="screen-name">@{item.user.screen_name}</span>
                </div>
                <div className="text">
                  {item.text}
                </div>
                <div className="extended-entities">
                  {self.extendedEntities(item.extended_entities)}
                </div>
                <div className="footer-tweet">
                  <a href={self.tweetLikeURL(item.id_str)} className="like" target="_blank">
                    <i className="icon-heart icons"></i>
                  </a>
                  <a className="time">{self.timeFormat(item.created_at)}</a>
                </div>
              </div>
            </div>
          )
        });
      return tweetHTML;
    }
  }

  componentDidMount() {
    var self = this;
    store.subscribe(function () {
      var user = store.getState();
      self.setState({user: user.user, tweets: user.tweets});
    });
  }

  render() {
    var self = this;
    if (self.state.tweets.length > 0) {
      self.tweetHTML = self.createTweet();
    }

    if (this.state.user) {
      return (
        <div className="user-info">
          <div className="user">
            <div className="user-img">
              <img
                src={this.state.user.detail.profile._json.profile_banner_url}
                className="profile-banner"/>
              <img
                src={this.state.user.detail.profile._json.profile_image_url}
                className="profile-avatar"/>
            </div>
            <div className="user-name-and-tweets">
              <div className="user-name">
                <span className="display-name">{this.state.user.detail.profile.displayName}</span>
                <span className="name">@{this.state.user.detail.profile.username}</span>
              </div>
              <div className="tweet-count">
                <span className="tweet-number">
                  {this.state.tweets.length}
                </span>
                tweets
              </div>
            </div>
            <div className="user-extended">
              <a
                href="#"
                className="btn btn-primary"
                onClick={this
                .logout
                .bind(this, this.state.user.id)}>Logout</a>
              <a href={this.global.apiGate + "/oauth_request"} className="btn btn-success">Refresh</a>
            </div>
          </div>
          <div className="tweets">
            {self.tweetHTML}
          </div>
        </div>
      )
    } else {
      return (
        <div></div>
      )
    }
  }
}

// Header Show the title or menu here
class Header extends Component {
  render() {
    return (
      <header className="header">
        Kichchi Twitter
      </header>
    )
  }
}

// Container Render content here
class LoginForm extends Component {

  constructor(props) {
    super(props);
    this.global = new Global();
  }

  static propTypes = {
    isShowFormLogin: PropTypes.bool
  }

  static defaultProps = {
    isShowFormLogin: false
  }

  render() {
    if (this.props.isShowFormLogin === true) {
      return (
        <div className="body">
          <div className="login-form">
            <span className="login-title">Login to your account</span>
            <div className="login-content">
              <a
                href={this.global.apiGate + "/oauth_request"}
                className="btn btn-primary btn-login">
                <i className="icon-social-twitter icons"></i>
                <span className="login-text">Login with Twitter</span>
              </a>
            </div>
          </div>
        </div>
      )
    } else {
      return (
        <div className="no-need-login-again"></div>
      )
    }
  }
}

// Render app here
class App extends Component {

  constructor(props) {
    super(props);
    this.global = new Global();
    this.state = {
      user: [],
      isShowFormLogin: false
    };
  }

  componentWillMount() {
    // Get all params
    this.getParams = new URLSearchParams(window.location.search);
    this.id = this
      .getParams
      .get("id");
    if (this.id) {
      localStorage.setItem("id", this.id);
    }
  }

  componentDidMount() {
    var self = this;

    // Check if we have id then we will cal the ajax service to server for getting
    // user information
    this.id = localStorage.getItem("id");
    if (this.id) {
      var header = new Headers();
      header.append('cache-control', 'no-cache');
      console.info(header);
      fetch(this.global.me.replace('{0}', this.id), {headers: header})
        .then(function (response) {
          return response.json();
        })
        .then(function (user) {
          if (user.err) {
            localStorage.clear();
            window.location.href = window.location.origin;
          } else {
            self.setState({user: user, isShowFormLogin: false});

            fetch(self.global.tweets.replace('{0}', self.id)).then(function (tweetsResponse) {
              return tweetsResponse.json();
            })
              .then(function (tweets) {
                store.dispatch({type: "SHOW", user: user, tweets: tweets})
              });
          }
        });
    } else {
      self.setState({isShowFormLogin: true});
    }
  }

  render() {
    return (
      <div>
        <Header/>
        <LoginForm isShowFormLogin={this.state.isShowFormLogin}/>
        <UserInfo/>
      </div>
    );
  }
}

export default App;
