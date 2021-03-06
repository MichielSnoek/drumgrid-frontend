import React, { useState, useContext } from "react";
import "./LoginBox.css";
import AuthService from "../../../../services/auth-service";
import { AuthContext } from "../../../../contexts/auth-context";

// Font Awesome
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHandPaper,
  faSignInAlt,
  faUserPlus,
  faAt,
  faUnlock,
  faCheck,
  faEnvelope,
} from "@fortawesome/free-solid-svg-icons";

export default function LoginBox(props) {
  const context = useContext(AuthContext);
  const [firstScreen, setFirstScreen] = useState(true);
  const [signUp, setSignUp] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [wrongUserName, setWrongUserName] = useState(false);
  const [wrongPassword, setWrongPassword] = useState(false);
  const [wrongEmail, setWrongEmail] = useState(false);
  const [signUpOkay, setSignUpOkay] = useState();
  const [forgotPassword, setForgotPassword] = useState();
  const [forgotPasswordOkay, setForgotPasswordOkay] = useState();
  const [loginError, setLoginError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const service = new AuthService();

  const handleLoginFormSubmit = (event) => {
    event.preventDefault();
    setIsLoading(true);
    setWrongUserName(false);
    setWrongPassword(false);
    setLoginError("");

    const pwd = password;
    setPassword("");

    context.makeLogin(username, pwd).then((response) => {
      if (!response.username) {
        if (response.message === "Missing credentials") {
          setWrongUserName(true);
          setWrongPassword(true);
          setLoginError(response.message);
          setIsLoading(false);
        }
        if (response.message === "Username not found") {
          setWrongUserName(true);
          setLoginError(response.message);
          setIsLoading(false);
        }
        if (response.message === "Password is incorrect") {
          setWrongPassword(true);
          setLoginError(response.message);
          setIsLoading(false);
        }
      }
    });
  };

  const handleSignupFormSubmit = (event) => {
    event.preventDefault();
    let error = false;
    setWrongUserName(false);
    setWrongPassword(false);
    setWrongEmail(false);

    // Check for empty fields
    if (!username) {
      error = true;
      setWrongUserName("Please fill something in");
    }
    if (!password) {
      error = true;
      setWrongPassword("Please fill something in");
    }
    if (!email) {
      error = true;
      setWrongEmail("Please fill something in");
    }

    if (!error) {
      setIsLoading(true);
      service
        .signup(username, password, email)
        .then((response) => {
          setIsLoading(false);
          if (response.error === "The username already exists") {
            setWrongUserName("That name already exists");
            return;
          }
          if (response.error === "The email address already exists") {
            setWrongEmail("Email already registered");
            return;
          }

          if (response.user) {
            const usr = username;
            const pwd = password;
            setSignUpOkay(true);
            setEmail("");
            setUsername("");
            setPassword("");
            setIsLoading(false);
            setTimeout(() => {
              props.close(usr, pwd);
            }, 3000);
          }
        })
        .catch((error) => console.log(error));
    }
  };

  const forgotPasswordSetup = () => {
    setForgotPasswordOkay(false);
    setForgotPassword(true);
  };

  const handleForgotPasswordFormSubmit = (event) => {
    setIsLoading(true)
    setWrongEmail("Checking email address");
    event.preventDefault();
    if (email) {
      service.forgotPassword(email).then((res) => {
        setIsLoading(false);
        if (res.error) {
          setWrongEmail(res.error);
        }

        if (res.message === "OK") {
          setForgotPasswordOkay(true);
          setWrongEmail(false);
          setEmail("");
        }
      });
    } else {
      setIsLoading(false);
      setWrongEmail("Please fill something in");
    }
  };

  return (
    <>
      {/* Signup Part */}
      {signUp ? (
        <div className="loginbox-signup-container scale-up-hor-right">
          {signUpOkay ? (
            <div className="loginbox-signup-container-inside loginbox-signup-container-inside-completed">
              <div className="loginbox-signup-container-inside-completed-icon slide-in-fwd-center">
                <FontAwesomeIcon icon={faCheck} />
              </div>
              <div>Signed up successfully!</div>
              <div className="loginbox-signup-container-inside-completed-softer">
                Please wait a little bit so the application can process it..
              </div>
            </div>
          ) : (
            <form onSubmit={handleSignupFormSubmit}>
              <div className="loginbox-signup-container-inside fade-in">
                <div className="loginbox-signup-container-inside-form">
                  <span>
                    <FontAwesomeIcon icon={faUserPlus} />
                  </span>
                  {typeof wrongUserName === "string" ? wrongUserName : "Your new username"}
                  {wrongUserName ? (
                    <input
                      className="loginbox-form-warning"
                      type="text"
                      name="username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                    />
                  ) : (
                    <input type="text" name="username" value={username} onChange={(e) => setUsername(e.target.value)} />
                  )}
                </div>
                <div className="loginbox-signup-container-inside-form">
                  <span>
                    <FontAwesomeIcon icon={faAt} />
                  </span>
                  {typeof wrongEmail === "string" ? wrongEmail : "What is your email"}
                  {wrongEmail ? (
                    <input
                      className="loginbox-form-warning"
                      type="email"
                      name="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  ) : (
                    <input type="email" name="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                  )}
                </div>
                <div className="loginbox-signup-container-inside-form">
                  <span>
                    <FontAwesomeIcon icon={faUnlock} />
                  </span>
                  {typeof wrongPassword === "string" ? wrongPassword : "Make up a password"}
                  {wrongPassword ? (
                    <input
                      className="loginbox-form-warning"
                      type="password"
                      name="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  ) : (
                    <input
                      type="password"
                      name="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  )}
                </div>
                <div className="loginbox-signup-container-inside-button">
                  {isLoading ? (
                    <div className="loginbox-loader-extra-padding-signup loader" />
                  ) : (
                    <button type="submit">SIGNUP</button>
                  )}
                </div>
              </div>
            </form>
          )}
        </div>
      ) : (
        // First Screen before login
        <div className="loginbox-container">
          {firstScreen ? (
            <div className="loginbox-container-prelogin-box">
              <div>
                <span className="loginbox-container-prelogin-icon">
                  <FontAwesomeIcon icon={faHandPaper} />
                </span>
              </div>
              <div className="loginbox-container-prelogin-box-contents">
                <span className="loginbox-container-prelogin-box-contents-header">PLEASE LOG IN</span>
                <p>You are currently not logged in. Please log in to access your patterns.</p>
                <button onClick={(e) => setFirstScreen(false)}>PROCEED</button>
              </div>
              <p className="loginbox-container-prelogin-signup" onClick={() => setSignUp(true)}>
                <span>Sign up instead?</span>
              </p>
            </div>
          ) : (
            <>
              {forgotPassword ? (
                // Forgot password screen
                <div className="loginbox-form">
                  {forgotPasswordOkay ? (
                    <div className="loginbox-signup-container-inside loginbox-signup-container-inside-completed">
                      <div className="loginbox-signup-container-inside-completed-icon">
                        <FontAwesomeIcon icon={faCheck} />
                      </div>
                      <div>Your password has been reset!</div>
                      <div className="loginbox-password-reset-softer">
                        Check your mailbox in a few minutes for an email with your new password.
                      </div>
                    </div>
                  ) : (
                    <form onSubmit={handleForgotPasswordFormSubmit}>
                      <div className="loginbox-signup-container-inside-form loginbox-password-reset">
                        <span>
                          <FontAwesomeIcon icon={faEnvelope} />
                        </span>
                        <div>{typeof wrongEmail === "string" ? wrongEmail : "Please fill in your email address"}</div>
                        {wrongEmail ? (
                          <input
                            className="loginbox-form-warning"
                            type="email"
                            name="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                          />
                        ) : (
                          <input type="email" name="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                        )}
                        <div className="loginbox-signup-container-inside-button loginbox-password-reset-btn">
                          {isLoading ? (
                            <div className="loginbox-loader-extra-padding-forgotpwd loader" />
                          ) : (
                            <button type="submit">SEND</button>
                          )}
                        </div>
                      </div>
                    </form>
                  )}
                </div>
              ) : (
                // Login screen
                <div className="loginbox-form">
                  <form onSubmit={handleLoginFormSubmit}>
                    <div className="loginbox-form-header">
                      <div className="loginbox-form-text ">USERNAME</div>
                      {wrongUserName ? (
                        <input
                          className="loginbox-form-error"
                          type="text"
                          name="username"
                          value={username}
                          onChange={(e) => setUsername(e.target.value)}
                        />
                      ) : (
                        <input
                          type="text"
                          name="username"
                          value={username}
                          onChange={(e) => setUsername(e.target.value)}
                        />
                      )}
                    </div>
                    <div className="loginbox-form-header">
                      <div className="loginbox-form-text">PASSWORD</div>
                      {wrongPassword ? (
                        <input
                          className="loginbox-form-error"
                          type="password"
                          name="password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                        />
                      ) : (
                        <input
                          type="password"
                          name="password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                        />
                      )}
                    </div>
                    <div className="loginbox-form-passwordreset" onClick={forgotPasswordSetup}>
                      FORGOT YOUR PASSWORD?
                    </div>
                    <div className="loginbox-form-submit">
                      {isLoading ? (
                        <div className="loader" />
                      ) : (
                        <button type="submit">
                          <FontAwesomeIcon icon={faSignInAlt} />
                        </button>
                      )}
                    </div>
                    <div className="loginbox-form-loginerror">{loginError}</div>
                  </form>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </>
  );
}
