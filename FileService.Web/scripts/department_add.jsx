class ReplaceDepartment extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            departmentName: "",
            departmentCode: "",
            message: ""
        };
    }
    componentDidMount() {
        this.getHexCode();
        orgChart();
    }
    getHexCode() {
        http.get(urls.getHexCodeUrl + "/12", function (data) {
            if (data.code == 0) {
                this.setState({ departmentCode: data.result });
            }
        }.bind(this));
    }
    
    render() {
        return (
            <div className={this.props.show ? "show" : "hidden"}>
                <div className="orgChart">
                    <ul style={{display:"none"}}>
                        <li>
                            <div className="node">0</div>
                            <ul>
                                <li>
                                    <div className="node">01</div>
                                    <ul>
                                        <li>
                                            <div className="node">011</div>
                                        </li>
                                    </ul>
                                </li>
                                <li>
                                    <div className="node">02</div>
                                    <ul>
                                        <li>
                                            <div className="node">021</div>
                                        </li>
                                        <li>
                                            <div className="node">022</div>
                                        </li>
                                        <li>
                                            <div className="node">023</div>
                                        </li>
                                    </ul>
                                </li>
                                <li>
                                    <div className="node">03</div>
                                </li>
                                <li>
                                    <div className="node">04</div>
                                    <ul>
                                        <li>
                                            <div className="node">041</div>
                                            <ul>
                                                <li>
                                                    <div className="node">0441</div>
                                                </li>
                                            </ul>
                                        </li>
                                        <li>
                                            <div className="node">042</div>
                                        </li>
                                        <li>
                                            <div className="node">043</div>
                                            <ul>
                                                <li>
                                                    <div className="node">0441</div>
                                                </li>
                                                <li>
                                                    <div className="node">0442</div>
                                                </li>
                                            </ul>
                                        </li>
                                    </ul>
                                </li>
                                <li>
                                    <div className="node">05</div>
                                    <ul>
                                        <li>
                                            <div className="node">051</div>
                                        </li>
                                        <li>
                                            <div className="node">052</div>
                                        </li>
                                        <li>
                                            <div className="node">053</div>
                                        </li>
                                    </ul>
                                </li>
                                <li>
                                    <div className="node">06</div>
                                    </li>
                            </ul>
                        </li>
                    </ul>
                    
                </div>
            </div>
        )
    }
}