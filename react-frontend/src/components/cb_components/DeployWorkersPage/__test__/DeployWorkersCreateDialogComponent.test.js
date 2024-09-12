import React from "react";
import { render, screen } from "@testing-library/react";

import DeployWorkersCreateDialogComponent from "../DeployWorkersCreateDialogComponent";
import { MemoryRouter } from "react-router-dom";
import "@testing-library/jest-dom";
import { init } from "@rematch/core";
import { Provider } from "react-redux";
import * as models from "../../../models";

test("renders deployWorkers create dialog", async () => {
  const store = init({ models });
  render(
    <Provider store={store}>
      <MemoryRouter>
        <DeployWorkersCreateDialogComponent show={true} />
      </MemoryRouter>
    </Provider>,
  );
  expect(
    screen.getByRole("deployWorkers-create-dialog-component"),
  ).toBeInTheDocument();
});
