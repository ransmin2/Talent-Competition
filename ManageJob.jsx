import React from 'react';
import ReactDOM from 'react-dom';
import Cookies from 'js-cookie';
import LoggedInBanner from '../../Layout/Banner/LoggedInBanner.jsx';
import { LoggedInNavigation } from '../../Layout/LoggedInNavigation.jsx';
import { JobSummaryCard } from './JobSummaryCard.jsx';
import { BodyWrapper, loaderData } from '../../Layout/BodyWrapper.jsx';
import { Pagination, Icon, Dropdown, Checkbox, Accordion, Form, Segment, Card, Button, Label, Header, Container } from 'semantic-ui-react';

export default class ManageJob extends React.Component {
    constructor(props) {
        super(props);
        let loader = loaderData
        loader.allowedUsers.push("Employer");
        loader.allowedUsers.push("Recruiter");
        this.state = {
            loadJobs: [],
            loaderData: loader,
            activePage: 1,
            sortBy: {
                date: "desc",
                display: "Newest First",
            },
            filter: {
                showActive: true,
                showClosed: false,
                showDraft: true,
                showExpired: true,
                showUnexpired: true
            },
            totalPages: 0,
            pageSize: 6,
            activeIndex: ""
        }

        this.loadData = this.loadData.bind(this);
        this.init = this.init.bind(this);
        this.loadNewData = this.loadNewData.bind(this);
        this.toggleFilter = this.toggleFilter.bind(this);
        this.handlePaginationChange = this.handlePaginationChange.bind(this);
    };

    init() {
        let loaderData = TalentUtil.deepCopy(this.state.loaderData)
        loaderData.isLoading = false;
        //this.setState({ loaderData });//comment this

        //set loaderData.isLoading to false after getting data
        this.loadData(() =>
            this.setState({ loaderData })
        )
    }

    componentDidMount() {
        this.init();
    };

    loadData(callback) {
     
        var link = 'http://localhost:51689/listing/listing/getSortedEmployerJobs';
        var cookies = Cookies.get('talentAuthToken');
        var { filter } = this.state;
        $.ajax({
            url: link,
            headers: {
                'Authorization': 'Bearer ' + cookies,
                'Content-Type': 'application/json'
            },
            type: "GET",
            contentType: "application/json",
            dataType: "json",
            data: {
                activePage: this.state.activePage,
                showActive: filter.showActive,
                showClosed: filter.showClosed,
                showDraft: filter.showDraft,
                showExpired: filter.showExpired,
                showUnexpired: filter.showUnexpired,
                sortbyDate: this.state.sortBy.date
            },
            success: function (res) {
                let loadJobs = null;
                let totalPages = 0;
                if (res.totalCount > 0) {
                    loadJobs = res.myJobs
                    totalPages = Math.ceil(res.totalCount / this.state.pageSize)
                }
                this.setState({ loadJobs, totalPages })
                callback();
            }.bind(this),
            error: function (res) {
                console.log(res.status)
            }
        });
    }

    loadNewData(data) {
        var loader = this.state.loaderData;
        loader.isLoading = true;
        data[loaderData] = loader;
        this.setState(data, () => {
            this.loadData(() => {
                loader.isLoading = false;
                this.setState({
                    loadData: loader
                })
            })
        });
    }

    toggleFilter(filterName) {
        const { filter } = this.state;
        filter[filterName] = !filter[filterName];
        this.setState({ filter }, this.init);
    }

    handlePaginationChange(e, { activePage }) {
        this.setState({ activePage }, this.init)
    }

    render() {
        return (
            <BodyWrapper reload={this.init} loaderData={this.state.loaderData}>
                <div className="ui container">
                    <Header size='large'>List of Jobs</Header>

                    <Icon name="filter" />
                    <span>Filter: </span>
                    <Dropdown text='Choose Filter'>
                        <Dropdown.Menu>
                            <Dropdown.Item onClick={() => this.toggleFilter("showActive")}>
                                <Checkbox
                                    label="Active"
                                    checked={this.state.filter.showActive}
                                    disabled
                                />
                            </Dropdown.Item>
                            <Dropdown.Item onClick={() => this.toggleFilter("showClosed")}>
                                <Checkbox
                                    label="Closed"
                                    checked={this.state.filter.showClosed}
                                    disabled
                                />
                            </Dropdown.Item>
                            <Dropdown.Item onClick={() => this.toggleFilter("showDraft")}>
                                <Checkbox
                                    label="Draft"
                                    checked={this.state.filter.showDraft}
                                    disabled
                                />
                            </Dropdown.Item>
                            <Dropdown.Item onClick={() => this.toggleFilter("showExpired")}>
                                <Checkbox
                                    label="Expired"
                                    checked={this.state.filter.showExpired}
                                    disabled
                                />
                            </Dropdown.Item>
                            <Dropdown.Item onClick={() => this.toggleFilter("showUnexpired")}>
                                <Checkbox
                                    label="Unexpired"
                                    checked={this.state.filter.showUnexpired}
                                    disabled
                                />
                            </Dropdown.Item>
                        </Dropdown.Menu>
                    </Dropdown>

                    <Icon name="calendar" />
                    <span>Sort by date: </span>
                    <Dropdown text={this.state.sortBy.display}>
                        <Dropdown.Menu>
                            <Dropdown.Item
                                text='Newest first'
                                onClick={() => this.setState({ sortBy: { date: "desc", display: "Newest First" } }, this.init)}
                            />
                            <Dropdown.Item
                                text='Oldest first'
                                onClick={() => this.setState({ sortBy: { date: "asc", display: "Oldest First" } }, this.init)}
                            />
                        </Dropdown.Menu>
                    </Dropdown>

                    {this.state.loadJobs ? this.renderJobSummaryCards() : <p>No Jobs Found</p>}

                    <div style={{ margin: 20, minHeight: 40 }}>
                        <Pagination totalPages={this.state.totalPages}
                            floated="right"
                            activePage={this.state.activePage}
                            onPageChange={this.handlePaginationChange} />
                    </div>
                </div>
            </BodyWrapper>
        )
    }

    renderJobSummaryCards() {
        return (
            <Card.Group itemsPerRow="3" stackable>
                {this.state.loadJobs.map((jobData, index) => <JobSummaryCard key={index} jobData={jobData} />)}
            </Card.Group>
        )
    }
}