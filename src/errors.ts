export class NineRouterError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "NineRouterError";
  }
}

export class NineRouterDiscoveryError extends NineRouterError {
  constructor(message: string) {
    super(message);
    this.name = "NineRouterDiscoveryError";
  }
}

export class NineRouterEmptyModelsError extends NineRouterError {
  constructor(message = "No models discovered") {
    super(message);
    this.name = "NineRouterEmptyModelsError";
  }
}

export class NineRouterAuthError extends NineRouterError {
  constructor(message: string) {
    super(message);
    this.name = "NineRouterAuthError";
  }
}

export class NineRouterValidationError extends NineRouterError {
  constructor(message: string) {
    super(message);
    this.name = "NineRouterValidationError";
  }
}
