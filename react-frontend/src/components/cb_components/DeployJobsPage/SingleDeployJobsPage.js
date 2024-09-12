import { Button } from "primereact/button";
import React, { useEffect, useState } from "react";
import { connect } from "react-redux";
import { Link, useNavigate, useParams } from "react-router-dom";
import client from "../../../services/restClient";
import { Tag } from "primereact/tag";
import moment from "moment";
import { InputText } from "primereact/inputtext";
import ProjectLayout from "../../Layouts/ProjectLayout";

import DeployWorkersPage from "../DeployWorkersPage/DeployWorkersPage";
import UsersPage from "../UsersPage/UsersPage";

const SingleDeployJobsPage = (props) => {
  const navigate = useNavigate();
  const urlParams = useParams();
  const [_entity, set_entity] = useState();

  useEffect(() => {
    //on mount
    client
      .service("deployJobs")
      .get(urlParams.singleDeployJobsId, {
        query: {
          $populate: [
            {
              path: "createdBy",
              service: "users",
              select: ["name"],
            },
            {
              path: "updatedBy",
              service: "users",
              select: ["name"],
            },
          ],
        },
      })
      .then((res) => {
        set_entity(res || {});
      })
      .catch((error) => {
        console.log({ error });
        props.alert({
          title: "DeployJobs",
          type: "error",
          message: error.message || "Failed get deployJobs",
        });
      });
  }, [props, urlParams.singleDeployJobsId]);

  const goBack = () => {
    navigate("/deployJobs");
  };

  return (
    <ProjectLayout>
      <div className="col-12 flex flex-column align-items-center">
        <div className="col-10">
          <div className="flex align-items-center justify-content-start">
            <Button
              className="p-button-text"
              icon="pi pi-chevron-left"
              onClick={() => goBack()}
            />
            <h3 className="m-0">DeployJobs</h3>
          </div>
          <p>deployJobs/{urlParams.singleDeployJobsId}</p>
          {/* ~cb-project-dashboard~ */}
        </div>
        <div className="card w-full">
          <div className="grid ">
            <div className="col-12 md:col-6 lg:col-3">
              <label className="text-sm text-primary">ProjectId</label>
              <p className="m-0 ml-3">{_entity?.projectId}</p>
            </div>
            <div className="col-12 md:col-6 lg:col-3">
              <label className="text-sm text-primary">Start</label>
              <p id="start" className="m-0 ml-3">
                {_entity?.start}
              </p>
            </div>
            <div className="col-12 md:col-6 lg:col-3">
              <label className="text-sm text-primary">Status</label>
              <p className="m-0 ml-3">
                <i
                  id="status"
                  className={`pi ${_entity?.status ? "pi-check" : "pi-times"}`}
                ></i>
              </p>
            </div>
            <div className="col-12 md:col-6 lg:col-3">
              <label className="text-sm text-primary">Url</label>
              <p className="m-0 ml-3">{_entity?.url}</p>
            </div>
            <div className="col-12 md:col-6 lg:col-3">
              <label className="text-sm text-primary">Port</label>
              <p className="m-0 ml-3">{Number(_entity?.port)}</p>
            </div>

            <div className="col-12">&nbsp;</div>
            <div className="col-12 md:col-6 lg:col-3">
              <Tag value="created By:"></Tag>
              <p className="m-0 ml-3">{_entity?.createdBy?.name}</p>
            </div>
            <div className="col-12 md:col-6 lg:col-3">
              <Tag value="created At:"></Tag>
              <p className="m-0 ml-3">{moment(_entity?.createdAt).fromNow()}</p>
            </div>
            <div className="col-12 md:col-6 lg:col-3">
              <Tag value="last Updated By:"></Tag>
              <p className="m-0 ml-3">{_entity?.updatedBy?.name}</p>
            </div>
            <div className="col-12 md:col-6 lg:col-3">
              <Tag value="updated At:"></Tag>
              <p className="m-0 ml-3">{moment(_entity?.updatedAt).fromNow()}</p>
            </div>
          </div>
        </div>
      </div>
      <DeployWorkersPage />
      <UsersPage />
    </ProjectLayout>
  );
};

const mapState = (state) => {
  const { user, isLoggedIn } = state.auth;
  return { user, isLoggedIn };
};

const mapDispatch = (dispatch) => ({
  alert: (data) => dispatch.toast.alert(data),
});

export default connect(mapState, mapDispatch)(SingleDeployJobsPage);
