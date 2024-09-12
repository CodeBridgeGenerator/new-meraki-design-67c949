import React, { useEffect, useState } from "react";
import { connect } from "react-redux";
import { useParams } from "react-router-dom";
import client from "../../../services/restClient";
import _ from "lodash";
import initilization from "../../../utils/init";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { Calendar } from "primereact/calendar";
import { Checkbox } from "primereact/checkbox";
import { InputNumber } from "primereact/inputnumber";

const getSchemaValidationErrorsStrings = (errorObj) => {
  let errMsg = {};
  for (const key in errorObj.errors) {
    if (Object.hasOwnProperty.call(errorObj.errors, key)) {
      const element = errorObj.errors[key];
      if (element?.message) {
        errMsg[key] = element.message;
      }
    }
  }
  return errMsg.length
    ? errMsg
    : errorObj.message
      ? { error: errorObj.message }
      : {};
};

const DeployJobsCreateDialogComponent = (props) => {
  const [_entity, set_entity] = useState({});
  const [error, setError] = useState({});
  const [loading, setLoading] = useState(false);
  const urlParams = useParams();

  useEffect(() => {
    let init = { status: false };
    if (!_.isEmpty(props?.entity)) {
      init = initilization({ ...props?.entity, ...init }, [], setError);
    }
    set_entity({ ...init });
  }, [props.show]);

  const validate = () => {
    let ret = true;
    const error = {};

    if (_.isEmpty(_entity?.projectId)) {
      error["projectId"] = `ProjectId field is required`;
      ret = false;
    }

    if (_.isEmpty(_entity?.url)) {
      error["url"] = `Url field is required`;
      ret = false;
    }
    if (!ret) setError(error);
    return ret;
  };

  const onSave = async () => {
    if (!validate()) return;
    let _data = {
      projectId: _entity?.projectId,
      start: _entity?.start,
      status: _entity?.status || false,
      url: _entity?.url,
      port: _entity?.port,
      createdBy: props.user._id,
      updatedBy: props.user._id,
    };

    setLoading(true);

    try {
      const result = await client.service("deployJobs").create(_data);
      props.onHide();
      props.alert({
        type: "success",
        title: "Create info",
        message: "Info DeployJobs created successfully",
      });
      props.onCreateResult(result);
    } catch (error) {
      console.log("error", error);
      setError(getSchemaValidationErrorsStrings(error) || "Failed to create");
      props.alert({
        type: "error",
        title: "Create",
        message: "Failed to create in DeployJobs",
      });
    }
    setLoading(false);
  };

  const renderFooter = () => (
    <div className="flex justify-content-end">
      <Button
        label="save"
        className="p-button-text no-focus-effect"
        onClick={onSave}
        loading={loading}
      />
      <Button
        label="close"
        className="p-button-text no-focus-effect p-button-secondary"
        onClick={props.onHide}
      />
    </div>
  );

  const setValByKey = (key, val) => {
    let new_entity = { ..._entity, [key]: val };
    set_entity(new_entity);
    setError({});
  };

  return (
    <Dialog
      header="Create DeployJobs"
      visible={props.show}
      closable={false}
      onHide={props.onHide}
      modal
      style={{ width: "40vw" }}
      className="min-w-max"
      footer={renderFooter()}
      resizable={false}
    >
      <div
        className="grid p-fluid overflow-y-auto"
        style={{ maxWidth: "55vw" }}
        role="deployJobs-create-dialog-component"
      >
        <div className="col-12 md:col-6 field mt-5">
          <span className="align-items-center">
            <label htmlFor="projectId">ProjectId:</label>
            <InputText
              id="projectId"
              className="w-full mb-3 p-inputtext-sm"
              value={_entity?.projectId}
              onChange={(e) => setValByKey("projectId", e.target.value)}
              required
            />
          </span>
          <small className="p-error">
            {!_.isEmpty(error["projectId"]) ? (
              <p className="m-0" key="error-projectId">
                {error["projectId"]}
              </p>
            ) : null}
          </small>
        </div>
        <div className="col-12 md:col-6 field mt-5">
          <span className="align-items-center">
            <label htmlFor="start">Start:</label>
            <Calendar
              id="start"
              value={_entity?.start ? new Date(_entity?.start) : new Date()}
              dateFormat="dd/mm/yy"
              onChange={(e) => setValByKey("start", new Date(e.target.value))}
              showIcon
              showButtonBar
            />
          </span>
          <small className="p-error">
            {!_.isEmpty(error["start"]) ? (
              <p className="m-0" key="error-start">
                {error["start"]}
              </p>
            ) : null}
          </small>
        </div>
        <div className="col-12 md:col-6 field flex mt-5">
          <span className="align-items-center">
            <label htmlFor="status">Status:</label>
            <Checkbox
              id="status"
              className="ml-3"
              checked={_entity?.status}
              onChange={(e) => setValByKey("status", e.checked)}
            />
          </span>
          <small className="p-error">
            {!_.isEmpty(error["status"]) ? (
              <p className="m-0" key="error-status">
                {error["status"]}
              </p>
            ) : null}
          </small>
        </div>
        <div className="col-12 md:col-6 field mt-5">
          <span className="align-items-center">
            <label htmlFor="url">Url:</label>
            <InputText
              id="url"
              className="w-full mb-3 p-inputtext-sm"
              value={_entity?.url}
              onChange={(e) => setValByKey("url", e.target.value)}
              required
            />
          </span>
          <small className="p-error">
            {!_.isEmpty(error["url"]) ? (
              <p className="m-0" key="error-url">
                {error["url"]}
              </p>
            ) : null}
          </small>
        </div>
        <div className="col-12 md:col-6 field mt-5">
          <span className="align-items-center">
            <label htmlFor="port">Port:</label>
            <InputNumber
              id="port"
              className="w-full mb-3 p-inputtext-sm"
              value={_entity?.port}
              onChange={(e) => setValByKey("port", e.target.value)}
            />
          </span>
          <small className="p-error">
            {!_.isEmpty(error["port"]) ? (
              <p className="m-0" key="error-port">
                {error["port"]}
              </p>
            ) : null}
          </small>
        </div>
        <small className="p-error">
          {Array.isArray(Object.keys(error))
            ? Object.keys(error).map((e, i) => (
                <p className="m-0" key={i}>
                  {e}: {error[e]}
                </p>
              ))
            : error}
        </small>
      </div>
    </Dialog>
  );
};

const mapState = (state) => {
  const { user } = state.auth;
  return { user };
};
const mapDispatch = (dispatch) => ({
  alert: (data) => dispatch.toast.alert(data),
});

export default connect(mapState, mapDispatch)(DeployJobsCreateDialogComponent);
