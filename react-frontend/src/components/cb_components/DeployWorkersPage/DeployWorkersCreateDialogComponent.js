import React, { useEffect, useState } from "react";
import { connect } from "react-redux";
import { useParams } from "react-router-dom";
import client from "../../../services/restClient";
import _ from "lodash";
import initilization from "../../../utils/init";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";

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

const DeployWorkersCreateDialogComponent = (props) => {
  const [_entity, set_entity] = useState({});
  const [error, setError] = useState({});
  const [loading, setLoading] = useState(false);
  const urlParams = useParams();
  const [deployerJobId, setDeployerJobId] = useState([]);

  useEffect(() => {
    let init = {};
    if (!_.isEmpty(props?.entity)) {
      init = initilization(
        { ...props?.entity, ...init },
        [deployerJobId],
        setError,
      );
    }
    set_entity({ ...init });
  }, [props.show]);

  const validate = () => {
    let ret = true;
    const error = {};

    if (_.isEmpty(_entity?.process)) {
      error["process"] = `Process field is required`;
      ret = false;
    }

    if (_.isEmpty(_entity?.task)) {
      error["task"] = `Task field is required`;
      ret = false;
    }
    if (!ret) setError(error);
    return ret;
  };

  const onSave = async () => {
    if (!validate()) return;
    let _data = {
      deployerJobId: _entity?.deployerJobId?._id,
      process: _entity?.process,
      task: _entity?.task,
      createdBy: props.user._id,
      updatedBy: props.user._id,
    };

    setLoading(true);

    try {
      const result = await client.service("deployWorkers").create(_data);
      const eagerResult = await client.service("deployWorkers").find({
        query: {
          $limit: 10000,
          _id: { $in: [result._id] },
          $populate: [
            {
              path: "deployerJobId",
              service: "deployJobs",
              select: ["url"],
            },
          ],
        },
      });
      props.onHide();
      props.alert({
        type: "success",
        title: "Create info",
        message: "Info DeployWorkers updated successfully",
      });
      props.onCreateResult(eagerResult.data[0]);
    } catch (error) {
      console.log("error", error);
      setError(getSchemaValidationErrorsStrings(error) || "Failed to create");
      props.alert({
        type: "error",
        title: "Create",
        message: "Failed to create in DeployWorkers",
      });
    }
    setLoading(false);
  };

  useEffect(() => {
    // on mount deployJobs
    client
      .service("deployJobs")
      .find({
        query: {
          $limit: 10000,
          $sort: { createdAt: -1 },
          _id: urlParams.singleDeployJobsId,
        },
      })
      .then((res) => {
        setDeployerJobId(
          res.data.map((e) => {
            return { name: e["url"], value: e._id };
          }),
        );
      })
      .catch((error) => {
        console.log({ error });
        props.alert({
          title: "DeployJobs",
          type: "error",
          message: error.message || "Failed get deployJobs",
        });
      });
  }, []);

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

  const deployerJobIdOptions = deployerJobId.map((elem) => ({
    name: elem.name,
    value: elem.value,
  }));

  return (
    <Dialog
      header="Create DeployWorkers"
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
        role="deployWorkers-create-dialog-component"
      >
        <div className="col-12 md:col-6 field mt-5">
          <span className="align-items-center">
            <label htmlFor="deployerJobId">DeployerJobId:</label>
            <Dropdown
              id="deployerJobId"
              value={_entity?.deployerJobId?._id}
              optionLabel="name"
              optionValue="value"
              options={deployerJobIdOptions}
              onChange={(e) => setValByKey("deployerJobId", { _id: e.value })}
            />
          </span>
          <small className="p-error">
            {!_.isEmpty(error["deployerJobId"]) ? (
              <p className="m-0" key="error-deployerJobId">
                {error["deployerJobId"]}
              </p>
            ) : null}
          </small>
        </div>
        <div className="col-12 md:col-6 field mt-5">
          <span className="align-items-center">
            <label htmlFor="process">Process:</label>
            <InputText
              id="process"
              className="w-full mb-3 p-inputtext-sm"
              value={_entity?.process}
              onChange={(e) => setValByKey("process", e.target.value)}
              required
            />
          </span>
          <small className="p-error">
            {!_.isEmpty(error["process"]) ? (
              <p className="m-0" key="error-process">
                {error["process"]}
              </p>
            ) : null}
          </small>
        </div>
        <div className="col-12 md:col-6 field mt-5">
          <span className="align-items-center">
            <label htmlFor="task">Task:</label>
            <InputText
              id="task"
              className="w-full mb-3 p-inputtext-sm"
              value={_entity?.task}
              onChange={(e) => setValByKey("task", e.target.value)}
              required
            />
          </span>
          <small className="p-error">
            {!_.isEmpty(error["task"]) ? (
              <p className="m-0" key="error-task">
                {error["task"]}
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

export default connect(
  mapState,
  mapDispatch,
)(DeployWorkersCreateDialogComponent);
