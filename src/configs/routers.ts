import LOGIN from '../pages/login.jsx';
import DASHBOARD from '../pages/dashboard.jsx';
import ACCOUNTS from '../pages/accounts.jsx';
import TASKS from '../pages/tasks.jsx';
import RISK from '../pages/risk.jsx';
import CHAT_LIST from '../pages/chat-list.jsx';
import CHAT_DETAIL from '../pages/chat-detail.jsx';
import CRON_JOBS from '../pages/cron-jobs.jsx';
import CRON_LOGS from '../pages/cron-logs.jsx';
import PROXY_MANAGEMENT from '../pages/proxy-management.jsx';
import SYSTEM_MANAGEMENT from '../pages/system-management.jsx';
export const routers = [{
  id: "login",
  component: LOGIN
}, {
  id: "dashboard",
  component: DASHBOARD
}, {
  id: "accounts",
  component: ACCOUNTS
}, {
  id: "tasks",
  component: TASKS
}, {
  id: "risk",
  component: RISK
}, {
  id: "chat-list",
  component: CHAT_LIST
}, {
  id: "chat-detail",
  component: CHAT_DETAIL
}, {
  id: "cron-jobs",
  component: CRON_JOBS
}, {
  id: "cron-logs",
  component: CRON_LOGS
}, {
  id: "proxy-management",
  component: PROXY_MANAGEMENT
}, {
  id: "system-management",
  component: SYSTEM_MANAGEMENT
}]