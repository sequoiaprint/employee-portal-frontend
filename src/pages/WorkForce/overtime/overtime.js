import React from "react";
import WeeklyOvertimeSummary from "../../../component/WorkForce/overtime/Bargraph";
import TopJobTitlesOvertimeChart from "../../../component/WorkForce/overtime/Bargraph2";
import OvertimeMachineTable from "../../../component/WorkForce/overtime/table";
import AllOvertimeMachineTable from "../../../component/WorkForce/overtime/table2";
import MachineUtilizationAnalysis from "../../../component/WorkForce/overtime/idleStats";

const Overtime = () => {
    return (
        <>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 p-4">
                <WeeklyOvertimeSummary />
                <TopJobTitlesOvertimeChart />
                <OvertimeMachineTable />
                <AllOvertimeMachineTable />

            </div>
            <MachineUtilizationAnalysis/>

        </>
    );
}
export default Overtime;