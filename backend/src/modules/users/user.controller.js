import * as userService from "./user.service.js";

// Controllers only deal with req/res; logic lives in the service.
export const list = (_req, res) => res.json(userService.findAll());

export const getOne = (req, res) => res.json(userService.getById(req.params.id));

export const create = (req, res) => res.status(201).json(userService.create(req.body));

export const update = (req, res) => res.json(userService.update(req.params.id, req.body));

export const remove = (req, res) => {
  userService.remove(req.params.id);
  res.status(204).end();
};
