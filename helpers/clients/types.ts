export type ClientListItem = {
  id?: string;
  clientCode?: string;
  firstName?: string;
  middleName?: string;
  lastName?: string;
  dob?: string;
  age?: number;
  suburb?: string;
  state?: string;
  policyTotal?: number;
  type?: string;
  claimStatus?: string;
  displayId?: string;
};

export type ClientOwnerDto = {
  title?: string;
  givenname?: string;
  middlename?: string;
  surname?: string;
  gender?: string;
  dateofbirth?: string;
  mobile?: string;
  email?: string;
  clientcode?: string;
  address?: Array<{
    address1?: string;
    suburb?: string;
    state?: string;
    postcode?: string;
  }>;
};

export type ClientPolicyRow = {
  portfoliocode?: string;
  product?: string;
  dateopened?: string;
  policyBalance?: string | number;
  status?: string;
  type?: string;
  claim?: { status?: string };
};

export type ClientOverviewResponse = {
  firstownerDto: ClientOwnerDto;
  policyDetailDto: ClientPolicyRow[];
};
