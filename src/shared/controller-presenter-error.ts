import { ErrorPresenter } from "../presenters/error";
import { ValidationErrorPresenter } from "../presenters/validation";
import { ValidationError } from "../usecases/errors/errors";

export const verifyAndReturnError = (error, res) => {
    let presenter;

    if (error instanceof ValidationError) {
        presenter = new ValidationErrorPresenter();
    } else {
        presenter = new ErrorPresenter();
    }

    presenter.present(error);
    res.status(presenter.getStatusCode()).send(presenter.getResponse());
}