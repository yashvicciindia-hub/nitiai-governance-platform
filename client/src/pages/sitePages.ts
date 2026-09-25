import { aboutPage } from "./about";
import { homePage } from "./siteHome";
import { policyPage } from "./policy";
import { resourcesPage } from "./resources";
import { solutionsPage } from "./solutions";
import { policeSafetyPage } from "./publicSafetyPage";

export const sitePages = [homePage, solutionsPage, policeSafetyPage, policyPage, resourcesPage, aboutPage] as const;

export function pageForPath(pathname: string) {
  return sitePages.find((page) => page.path === pathname) || homePage;
}