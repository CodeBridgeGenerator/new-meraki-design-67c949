import { Button } from "primereact/button";
import React, { useEffect, useState } from "react";
import { connect } from "react-redux";
import { Link, useNavigate, useParams } from "react-router-dom";
import client from "../../../services/restClient";
import { Tag } from "primereact/tag";
import moment from "moment";
import { InputText } from "primereact/inputtext";
import ProjectLayout from "../../Layouts/ProjectLayout";

const SingleDeployWorkersPage = (props) => {
  const navigate = useNavigate();
  const urlParams = useParams();
  const [_entity, set_entity] = useState();

  const [deployerJobId, setDeployerJobId] = useState([]);

  useEffect(() => {
    //on mount
    client
      .service("deployWorkers")
      .get(urlParams.singleDeployWorkersId, {
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
            "deployerJobId",
          ],
        },
      })
      .then((res) => {
        set_entity(res || {});
        const deployerJobId = Array.isArray(res.deployerJobId)
          ? res.deployerJobId.map((elem) => ({ _id: elem._id, url: elem.url }))
          : res.deployerJobId
            ? [{ _id: res.deployerJobId._id, url: res.deployerJobId.url }]
            : [];
        setDeployerJobId(deployerJobId);
      })
      .catch((error) => {
        console.log({ error });
        props.alert({
          title: "DeployWorkers",
          type: "error",
          message: error.message || "Failed get deployWorkers",
        });
      });
  }, [props, urlParams.singleDeployWorkersId]);

  const goBack = () => {
    navigate("/deployWorkers");
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
            <h3 className="m-0">DeployWorkers</h3>
          </div>
          <p>deployWorkers/{urlParams.singleDeployWorkersId}</p>
          {/* ~cb-project-dashboard~ */}
        </div>
        <div className="card w-full">
          <div className="grid ">
            <div className="col-12 md:col-6 lg:col-3">
              <label className="text-sm text-primary">Process</label>
              <p className="m-0 ml-3">{_entity?.process}</p>
            </div>
            <div className="col-12 md:col-6 lg:col-3">
              <label className="text-sm text-primary">Task</label>
              <p className="m-0 ml-3">{_entity?.task}</p>
            </div>
            <div className="col-12 md:col-6 lg:col-3">
              <label className="text-sm">DeployerJobId</label>
              {deployerJobId.map((elem) => (
                <Link key={elem._id} to={`/deployJobs/${elem._id}`}>
                  <div className="card">
                    <p className="text-xl text-primary">{elem.url}</p>
                  </div>
                </Link>
              ))}
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

export default connect(mapState, mapDispatch)(SingleDeployWorkersPage);
