import { DBCONNECT } from "../../shared/database";
import { NextApiRequest, NextApiResponse } from "next";
export default async function (req: NextApiRequest, res: NextApiResponse) {
    const remove_login_logs = `Delete FROM user_logs WHERE last_login < current_date - INTERVAL '7 days'`;
    const remove_action_logs = `Delete FROM user_action_logs WHERE log_time < current_date - INTERVAL '7 days'`;
    const remove_logs = await DBCONNECT(remove_login_logs);
    const remove_action = await DBCONNECT(remove_action_logs);
    res.status(200).json({ message: 'Data before the last one week has been removed' })
}
