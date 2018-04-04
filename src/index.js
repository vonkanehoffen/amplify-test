import React from "react";
import { render } from "react-dom";
import Amplify, { Auth } from "aws-amplify";

window.LOG_LEVEL = 'DEBUG';

Amplify.configure({
  Auth: {
    identityPoolID: 'us-east-1:0bfc4202-3ee7-4601-9b1c-e9bed31808a8',
    region: 'us-east-1',
    userPoolId: 'us-east-1_qayWwJ35i',
    userPoolWebClientId: '62t05ai42nmqq3r1s62kht48ik',
    mandatorySignIn: true,
  }})

const styles = {
  fontFamily: "sans-serif",
  textAlign: "center"
};

class App extends React.Component {
  state = {
    gaInitialized: false,
    id_token: false,
    federatedResponse: false
  };

  componentDidMount() {
    this.createScript();
  }

  createScript = () => {
    const script = document.createElement("script");
    script.src = "https://apis.google.com/js/platform.js";
    script.async = true;
    script.onload = this.initGapi;
    document.body.appendChild(script);
  };

  initGapi = () => {
    console.log("init gapi");

    const g = window.gapi;
    g.load("auth2", () => {
      g.auth2.init({
        client_id:
          "431648118408-eba6o4rsi5b5ltr8ujcmbmcvjcm6t7gc.apps.googleusercontent.com",
        scope: "profile email openid"
      });
      console.log("gapi auth2 loaded");
      this.setState({ gaInitialized: true });
    });
  };

  googleSignIn = () => {

    const ga = window.gapi.auth2.getAuthInstance();
    ga.signIn().then(googleUser => {
      const { id_token, expires_at } = googleUser.getAuthResponse();
      const profile = googleUser.getBasicProfile();
      const user = {
        email: profile.getEmail(),
        name: profile.getName()
      };
      console.log("gauth response:", id_token, expires_at, user);
      this.setState({ id_token })
      return Auth.federatedSignIn(
        "google",
        { token: id_token, expires_at },
        user
      ).then(response => {
        console.log("federated response:", response);
        this.setState({ federatedResponse: response })
        Auth.currentCredentials().then(r =>
          console.log("currentCredentials", r)
        );
      });
    });
  };

  render() {
    return (
      <div style={styles}>
        <h1>AWS Amplify test</h1>
        <pre>{JSON.stringify(this.state, null, 2)}</pre>
        <button onClick={this.googleSignIn}>Google Sign in</button>
      </div>
    );
  }
}

render(<App />, document.getElementById("root"));
