import { ModelsUsers } from 'src/app/models/users.models';
import { ModelsNotifications } from 'src/app/models/notifications.models';
import { ModelsAccess } from 'src/app/models/access.models';

export namespace Models {

    export import User = ModelsUsers;
    //export import Tienda = ModelsTienda;
    export import Notifications = ModelsNotifications;
    export import AccessReq = ModelsAccess;

}
