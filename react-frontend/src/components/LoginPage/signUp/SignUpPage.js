import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { connect } from "react-redux";
import client from "../../../services/restClient";
import _ from "lodash";
import SignUpStep from "./SignUpStep";
import { Link } from "react-router-dom";
import { emailRegex } from "../../../utils/regex";
import EnterDetailsStep from "./step/EnterDetails";
import VerificationStep from "./step/Verification";
import SetUpPassword from "./step/SetUpPassword";
import AppFooter from "../../Layouts/AppFooter";

const SignUpPage = (props) => {
  const navigate = useNavigate();
  const isSignup = /signup/.test(location.pathname);
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [emailInvites, setUserEmailInvites] = useState([]);
  const [selectedEmails, setSelectedEmails] = useState([]);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");
  const [nameError, setNameError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [isVerified, setVerified] = useState(false);
  const [code, setCode] = useState();
  const [codeError, setCodeError] = useState("");
  const [genCode, setGenCode] = useState();
  const [passwordError, setPasswordError] = useState(null);
  const [step, setStep] = useState(1);
  const useUserInvite = process.env.REACT_APP_USE_USER_INVITE_SIGNUP;

  useEffect(() => {
    if (useUserInvite === "true") {
      _get();
    }
  }, []);

  const _get = async () => {
    let data = await client.service("userInvites").find({
      query: {
        status: false,
        $sort: {
          emailToInvite: 1,
        },
      },
    });
    if (data?.data?.length !== 0) {
      setUserEmailInvites(data.data);
      setSelectedEmails(data.data);
    } else {
      props.alert({
        title: "Email invites not found",
        type: "error",
        message: "Server error, please contact admin.",
      });
    }
  };

  const _getEmail = async () => {
    return await client.service("userInvites").find({
      query: {
        emailToInvite: email.emailToInvite,
      },
    });
  };

  const _getUserEmail = async () => {
    return await client.service("users").find({
      query: {
        email: email.emailToInvite,
      },
    });
  };

  const _setCode = async (id, code) => {
    return await client.service("userInvites").patch(id, {
      code,
    });
  };

  const _setCounter = async (id, count) => {
    return await client.service("userInvites").patch(id, {
      sendMailCounter: count,
    });
  };

  const verify = () => {
    if (
      Number(code) === Number(genCode) ||
      Number(code) === Number(email?.code)
    ) {
      setVerified(true);
      props.alert({
        title: "Verification successful.",
        type: "success",
        message: "Proceed to create your account.",
      });
    } else {
      setCodeError("Code verification failed");
      props.alert({
        title: "Verification failed.",
        type: "error",
        message: "Proceed to contact admin.",
      });
    }
  };

  const validate = () => {
    let isValid = true;
    if (!email.emailToInvite) {
      setEmailError("Please Enter a valid email");
      isValid = false;
    }

    if (!name.length) {
      setNameError("name is required");
      isValid = false;
    } else if (name.length < 3) {
      setNameError("Must be at least 3 characters long");
      isValid = false;
    }
    if (!password.length) {
      setPasswordError("Password is required");
      isValid = false;
    } else if (password.length < 6) {
      setPasswordError(
        "Must be at least 6 characters long and have at least one letter, digit, uppercase, lowercase and symbol",
      );
      isValid = false;
    }

    if (password !== confirmPassword) {
      setPasswordError("Confirm Password is not correct");
      isValid = false;
    }

    return isValid;
  };

  const signup = async () => {
    const user = await _getUserEmail();
    if (validate()) {
      try {
        if (user?.data?.length === 0) {
          props
            .createUser({
              name,
              email: email?.emailToInvite,
              password,
              status: true,
            })
            .then(async () => {
              navigate("/login");
            });
          props.alert({
            title: "User account created successfully.",
            type: "success",
            message: "Proceed to login.",
          });
        } else {
          navigate("/login");
          props.alert({
            title: "User account already created.",
            type: "warn",
            message: "Proceed to login.",
          });
        }
      } catch (error) {
        if (error.message === "email: value already exists.") {
          client
            .service("userLogin")
            .create({ loginEmail: email?.emailToInvite });
          navigate("/login");
          props.alert({
            title: "User account already exists.",
            type: "success",
            message: "Proceed to login.",
          });
        } else {
          props.alert({
            title: "User account failed to create.",
            type: "error",
            message: error.message || "Failed to sign in.",
          });
        }
      }
    } else {
      props.alert({
        title: "Sign up failed.",
        type: "error",
        message: "Please contact admin.",
      });
      return;
    }
  };

  const validateEmailSending = () => {
    if (!email) {
      props.alert({
        title: "Email not selected",
        type: "error",
        message: "Proceed to contact admin.",
      });
      return false;
    }
    return true;
  };

  const validateEmailInvite = (userInvite) => {
    if (!userInvite) {
      props.alert({
        title: "User invitation not found.",
        type: "error",
        message: "Proceed to contact admin.",
      });
      return false;
    }
    return true;
  };

  const validateEmailSentCount = (userInvite) => {
    if (userInvite.sendMailCounter > 3) {
      props.alert({
        title: "Too many retries",
        type: "error",
        message: "Proceed to contact admin.",
      });
      return false;
    }
    return true;
  };

  const resendMail = async () => {
    let _code;
    if (!validateEmailSending()) return;
    const userInviteData = await _getEmail();
    const userInvite = userInviteData.data[0];
    if (!validateEmailInvite(userInvite)) return;
    if (!validateEmailSentCount(userInvite)) return;

    if (userInvite?.code) {
      _code = userInvite?.code;
      setGenCode(userInvite?.code);
    } else if (email?.code) {
      _code = email?.code;
      setGenCode(email?.code);
    } else if (email?._id) {
      _code = codeGen();
      setGenCode(_code);
      await _setCode(email?._id, _code);
    } else {
      props.alert({
        title: "Email not found in invitation list.",
        type: "warn",
        message: "Proceed to check with your admin.",
      });
      return;
    }

    const _mail = {
      name: "onCodeVerifyEmail",
      type: "signup",
      from: "info@cloudbasha.com",
      recipients: [email?.emailToInvite],
      status: true,
      data: { name: name, code: _code },
      subject: "signup verify processing",
      templateId: "onCodeVerify",
    };
    setLoading(true);
    await client.service("mailQues").create(_mail);
    props.alert({
      title: "Verification email sent.",
      type: "success",
      message: "Proceed to check your email inbox.",
    });
    _setCounter(userInvite._id, Number(userInvite.sendMailCounter) + 1);
    setLoading(false);
    setStep(2);
  };

  const codeGen = () => {
    let theCode = Math.floor(Math.random() * 999999);
    while (theCode < 100001) {
      theCode = Math.floor(Math.random() * 999999);
    }
    return theCode;
  };

  const search = (event) => {
    setSelectedEmails(
      _.filter(
        emailInvites,
        (item) => item.emailToInvite.indexOf(event.query) > -1,
      ),
    );
  };

  const onFinishStepOne = () => {
    if (!emailRegex.test(email.emailToInvite || email)) {
      setEmailError("Please enter a valid email");
      return;
    }
    if (!name.length) {
      setNameError("name is required");
      return;
    }
    resendMail();
  };

  const onFinishStepTwo = () => {
    if (!code || code.length !== 6) {
      setCodeError("Please enter the code");
      return;
    }
    setStep(3);
  };

  const onFinishStepThree = () => {
    if (!password) {
      setPasswordError("Password is required");
      return;
    }
    if (password !== confirmPassword) {
      setConfirmPasswordError("Confirm Password is not correct");
      return;
    }

    signup();
  };

  return (
    <div className="flex flex-col min-h-screen align-items-center justify-content-center bg-[#F8F9FA]">
      <div className="fixed top-0 left-0 w-full">
        <div className="flex items-center justify-between p-5 bg-white shadow">
          <div className="basis-auto">
            <p className="text-xl font-semibold text-primary">CodeBridge</p>
          </div>
          <div className="basis-[700px]">
            <SignUpStep step={step} />
          </div>
          <div className="basis-auto"></div>
        </div>
        <div className="flex items-center gap-2 p-5 bg-transparent">
          <Link
            to="/login"
            className="flex items-center gap-2 font-semibold text-primary"
          >
            <i className="pi pi-angle-left"></i>
            <p>Back to login</p>
          </Link>
        </div>
      </div>
      <div className="flex flex-col items-center justify-center flex-1 px-3">
        {step === 1 && (
          <EnterDetailsStep
            search={search}
            email={email}
            setEmail={setEmail}
            emailError={emailError}
            setEmailError={setEmailError}
            selectedEmails={selectedEmails}
            isVerified={isVerified}
            name={name}
            setName={setName}
            nameError={nameError}
            setNameError={setNameError}
            onNext={onFinishStepOne}
            loading={loading}
          />
        )}
        {step === 2 && (
          <VerificationStep
            code={code}
            setCode={setCode}
            codeError={codeError}
            setCodeError={setCodeError}
            onNext={onFinishStepTwo}
            resendCode={resendMail}
            loading={loading}
          />
        )}
        {step === 3 && (
          <SetUpPassword
            password={password}
            setPassword={setPassword}
            confirmPassword={confirmPassword}
            setConfirmPassword={setConfirmPassword}
            passwordError={passwordError}
            setPasswordError={setPasswordError}
            confirmPasswordError={confirmPasswordError}
            setConfirmPasswordError={setConfirmPasswordError}
            onNext={onFinishStepThree}
            loading={loading}
          />
        )}
      </div>
      <AppFooter />
    </div>
  );
};

const mapState = (state) => {
  const { isLoggedIn, passwordPolicyErrors } = state.auth;
  return { isLoggedIn, passwordPolicyErrors };
};
const mapDispatch = (dispatch) => ({
  createUser: (data) => dispatch.auth.createUser(data),
  alert: (data) => dispatch.toast.alert(data),
});

export default connect(mapState, mapDispatch)(SignUpPage);
