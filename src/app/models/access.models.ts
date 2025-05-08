export namespace ModelsAccess {
  export interface AccessRequestsI {
    id?: string;
    fullname: string;
    email: string;
    phone: string;
    group: string;
    created_at: string;
    information: string;
    status: string;
    subjectSchool?: string;
    courseTeacher?: string;
    sectionTeacher?: string;
    modalidad?: string;
    courseStudent?: string;
    schoolYear?: string;
    nameChildren?: string;
    courseFather?: string;
    sectionFather?: string;
    workshop?: string;
  }
}
