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
    nameChanged(e) {
        this.setState({ departmentName: e.target.value });
    }
    orderChanged(e) {
        this.setState({ order: e.target.value });
    }
    layerChanged(e) {
        this.setState({ layer: e.target.value });
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
                            <td>
                                <input type="text"
                                    name="order"
                                    size="6"
                                    value={this.state.order}
                                    onChange={this.orderChanged.bind(this)} /><font color="red">*</font>
                            </td>
                        </tr>
                        <tr>
                            <td>{culture.layer}:</td>
                            <td>
                                <input type="text"
                                    name="layer"
                                    size="6"
                                    value={this.state.layer}
                                    onChange={this.layerChanged.bind(this)} /><font color="red">*</font>
                            </td>
                        </tr>
                        <tr>
                            <td colSpan="2"><input type="button"
                                value={culture.add}
                                className="button"
                                onClick={this.addDepartment.bind(this)} /><font color="red">{" " + this.state.message}</font>
                            </td>
                        </ tr>
                    </tbody>
                </table>
            </div>
        )
    }
}