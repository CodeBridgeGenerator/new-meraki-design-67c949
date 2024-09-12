import React from "react";
import { render, screen } from "@testing-library/react";

import DeployJobsPage from "../DeployJobsPage";
import { MemoryRouter } from "react-router-dom";
import "@testing-library/jest-dom";
import { init } from "@rematch/core";
import { Provider } from "react-redux";
import * as models from "../../../models";

test("renders deployJobs page", async () => {
  const store = init({ models });
  render(
    <Provider store={store}>
      <MemoryRouter>
        <DeployJobsPage />
      </MemoryRouter>
    </Provider>,
  );
  expect(screen.getByRole("deployJobs-datatable")).toBeInTheDocument();
  expect(screen.getByRole("deployJobs-add-button")).toBeInTheDocument();
});
