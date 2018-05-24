class AddSubDepartment extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            departmentName: "",
            order: 0,
            layer: 0,
            message: ""
        };
    }
    nameChanged() {

    }
    addDepartment() {

    }
    render() {
        return (
            <div className={this.props.show ? "show" : "hidden"}>
                <table className="table" style={{ width: "35%" }}>
                    <tbody>
                        <tr>
                            <td>{culture.department_name}:</td>
                            <td>
                                <input type="text"
                                    name="departmentName"
                                    value={this.state.departmentName}
                                    onChange={this.nameChanged.bind(this)} /><font color="red">*</font>
                            </td>
                        </tr>
                        <tr>
                            <td>{culture.order}:</td>
                            <td></td>
                        </tr>
                        <tr>
                            <td>{culture.layer}:</td>
                            <td></td>
                        </tr>
                        <tr>
                            <td colSpan="2"><input type="button"
                                value={culture.add}
                                className="button"
                                onClick={this.addDepartment.bind(this)} /><font color="red">{" " + this.state.message}</font></td>
                        </ tr>
                    </tbody>
                </table>
            </div>
        )
    }
}