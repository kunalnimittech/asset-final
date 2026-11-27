import * as userService from "./user.service.js";

// Controllers only deal with req/res; logic lives in the service.
// Express 5 forwards rejected promises to errorHandler, so no try/catch needed.
export const me = (req, res) => res.json(req.user);

export const list = async (_req, res) => res.json(await userService.findAll());

export const getOne = async (req, res) => res.json(await userService.getById(req.params.id));

export const create = async (req, res) => res.status(201).json(await userService.create(req.body));

export const update = async (req, res) => res.json(await userService.update(req.params.id, req.body));

export const remove = async (req, res) => {
  await userService.remove(req.params.id, req.user.id);
  res.status(204).end();
};
