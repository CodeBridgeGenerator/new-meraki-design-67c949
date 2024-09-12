import React, { useEffect, useState } from "react";
import { connect } from "react-redux";
import { useParams } from "react-router-dom";
import client from "../../../services/restClient";
import _ from "lodash";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { Tag } from "primereact/tag";
import moment from "moment";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";

const getSchemaValidationErrorsStrings = (errorObj) => {
  let errMsg = {};
  for (const key in errorObj.errors) {
    if (Object.hasOwnProperty.call(errorObj.errors, key)) {
      const element = errorObj.errors[key];
      if (element?.message) {
        errMsg.push(element.message);
      }
    }
  }
  return errMsg.length ? errMsg : errorObj.message ? errorObj.message : null;
};

const DeployWorkersCreateDialogComponent = (props) => {
  const [_entity, set_entity] = useState({});
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const urlParams = useParams();
  const [deployerJobId, setDeployerJobId] = useState([]);

  useEffect(() => {
    set_entity(props.entity);
  }, [props.entity, props.show]);

  useEffect(() => {
    //on mount deployJobs
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

  const onSave = async () => {
    let _data = {
      deployerJobId: _entity?.deployerJobId?._id,
      process: _entity?.process,
      task: _entity?.task,
    };

    setLoading(true);
    try {
      await client.service("deployWorkers").patch(_entity._id, _data);
      const eagerResult = await client.service("deployWorkers").find({
        query: {
          $limit: 10000,
          _id: { $in: [_entity._id] },
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
        title: "Edit info",
        message: "Info deployWorkers updated successfully",
      });
      props.onEditResult(eagerResult.data[0]);
    } catch (error) {
      console.log("error", error);
      setError(
        getSchemaValidationErrorsStrings(error) || "Failed to update info",
      );
      props.alert({
        type: "error",
        title: "Edit info",
        message: "Failed to update info",
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

  const deployerJobIdOptions = deployerJobId.map((elem) => ({
    name: elem.name,
    value: elem.value,
  }));

  return (
    <Dialog
      header="Edit DeployWorkers"
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
        role="deployWorkers-edit-dialog-component"
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
        </div>
        <div className="col-12">&nbsp;</div>
        <div className="col-12 md:col-6 field mt-5">
          <p className="m-0">
            <Tag value="created At:"></Tag>
            {" " + moment(_entity?.createdAt).fromNow()}
          </p>
        </div>
        <div className="col-12 md:col-6 field mt-5">
          <p className="m-0">
            <Tag value="created By:"></Tag>
            {" " + _entity?.createdBy?.name}
          </p>
        </div>
        <div className="col-12 md:col-6 field mt-5">
          <p className="m-0">
            <Tag value="last Updated At:"></Tag>
            {" " + moment(_entity?.updatedAt).fromNow()}
          </p>
        </div>
        <div className="col-12 md:col-6 field mt-5">
          <p className="m-0">
            <Tag value="last Updated By:"></Tag>
            {" " + _entity?.updatedBy?.name}
          </p>
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
