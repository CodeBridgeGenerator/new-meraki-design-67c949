import React from "react";
import { render, screen } from "@testing-library/react";

import DeployWorkersPage from "../DeployWorkersPage";
import { MemoryRouter } from "react-router-dom";
import "@testing-library/jest-dom";
import { init } from "@rematch/core";
import { Provider } from "react-redux";
import * as models from "../../../models";

test("renders deployWorkers page", async () => {
  const store = init({ models });
  render(
    <Provider store={store}>
      <MemoryRouter>
        <DeployWorkersPage />
      </MemoryRouter>
    </Provider>,
  );
  expect(screen.getByRole("deployWorkers-datatable")).toBeInTheDocument();
  expect(screen.getByRole("deployWorkers-add-button")).toBeInTheDocument();
});
