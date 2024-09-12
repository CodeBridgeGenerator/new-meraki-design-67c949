import React from "react";
import { render, screen } from "@testing-library/react";

import DeployJobsCreateDialogComponent from "../DeployJobsCreateDialogComponent";
import { MemoryRouter } from "react-router-dom";
import "@testing-library/jest-dom";
import { init } from "@rematch/core";
import { Provider } from "react-redux";
import * as models from "../../../models";

test("renders deployJobs create dialog", async () => {
  const store = init({ models });
  render(
    <Provider store={store}>
      <MemoryRouter>
        <DeployJobsCreateDialogComponent show={true} />
      </MemoryRouter>
    </Provider>,
  );
  expect(
    screen.getByRole("deployJobs-create-dialog-component"),
  ).toBeInTheDocument();
});
