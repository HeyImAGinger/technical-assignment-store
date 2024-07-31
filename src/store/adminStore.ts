import { Restrict } from "../decorators/restrict";
import { lazy } from "../utils/lazy";
import { Store } from "./store";
import { UserStore } from "./userStore";

export class AdminStore extends Store {
  @Restrict("r")
  public user: UserStore;

  @Restrict()
  name: string = "John Doe";

  constructor(user: UserStore) {
    super();
    this.defaultPolicy = "none";
    this.user = user;
  }

  @Restrict("rw")
  getCredentials = lazy(() => {
    const credentialStore = new Store();
    credentialStore.writeEntries({ username: "user1" });
    return credentialStore;
  });
}
