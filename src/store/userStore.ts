import { Restrict } from "../decorators/restrict";
import { Store } from "./store";

export class UserStore extends Store {
  @Restrict("rw")
  name: string = "John Doe";

  constructor() {
    super();
    this.defaultPolicy = "rw";
  }
}
