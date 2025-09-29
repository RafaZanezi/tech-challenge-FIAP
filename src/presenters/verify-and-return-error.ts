import { ErrorPresenter } from "./error";
import { ValidationErrorPresenter } from "./validation";
import { ValidationError } from "../usecases/errors/errors";
import { HttpError } from "../api/errors/http-errors";

export const verifyAndReturnError = (error, res) => {
    let presenter;

    if (error instanceof ValidationError) {
        presenter = new ValidationErrorPresenter();
    } else if (error instanceof HttpError) {
        presenter = new ErrorPresenter();
        presenter.present(error);
        res.status(error.statusCode).send(presenter.getResponse());
        return;
    } else {
        presenter = new ErrorPresenter();
    }

    presenter.present(error);
    res.status(presenter.getStatusCode()).send(presenter.getResponse());
}