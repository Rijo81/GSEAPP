export interface GroupsI{
  id?: string;
  name: string;
  parentId?: string | null;
  permition_states?: boolean;
  permition_groups?: boolean;
  permition_users?: boolean;
  permition_typerequests?: boolean;
  permition_requests?: boolean;
  permition_viewsolic?: boolean;
  permition_state_requests?: boolean;
  permition_access_requests?: boolean;
  permition_init_excuse?: boolean;
  permition_init_request?: boolean;
  permition_config?: boolean;
}

export interface GroupI{
  id?: number;
  name: string;
  parentId: number | null;
}
