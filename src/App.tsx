import React from 'react';
import './App.scss';
import axios from 'axios';
import { Alert, AlertType, IAlert } from './utils/Alert.component';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import { Button, Input } from '@material-ui/core';
import SearchIcon from '@material-ui/icons/Search';

interface AnimeApiResponse {
  title: string;
  score: number;
  start_date: string;
  end_date: string;
  episodes: number;
  type: string;
  rated: string;
}

interface Anime {
  title: string;
  score: number;
  year: string;
  episodes: number;
  type: string;
  status: string;
  rated: string;
}

class App extends React.Component {

  state: {
    alerts: IAlert[],
    search: string,
    searchPhrase: string,
    disableSearch: boolean,
    onlyMatches: boolean,
    animeList: Anime[],
  } = {
      alerts: [],
      search: '',
      searchPhrase: '',
      disableSearch: false,
      onlyMatches: true,
      animeList: [],
    }

  addAlert(type: AlertType, message: string) {
    this.setState({
      alerts: [
        ...this.state.alerts,
        {
          message,
          type
        }
      ]
    });
    setTimeout(() => {
      this.setState({ alerts: [...this.state.alerts].slice(1) });
    },
      3000
    );
  }

  search = (e: React.MouseEvent<HTMLButtonElement>) => {
    this.setState({
      disableSearch: false
    });

    // see https://jikan.docs.apiary.io/#reference/0/search for more details
    axios.get(`https://api.jikan.moe/v3/search/anime?q=${this.state.search}&page=1&order_by=start_date`)
      .then((res: any) => {
        this.setState({
          searchPhrase: this.state.search,
          animeList: res.data.results.map((a: AnimeApiResponse) => {
            return {
              title: a.title,
              score: a.score,
              year: a.start_date?.split('-')[0],
              episodes: a.episodes,
              type: a.type,
              status: !!a.end_date ? 'Finished' : (!!a.start_date ? 'Ongoing' : 'Upcoming'),
              rated: a.rated
            };
          })
        }, () => this.setState({ disableSearch: false }));
      })
      .catch((err: any) => this.addAlert(AlertType.ERROR, err.message));
  }

  render() {
    return (
      <div className="App">
        {/* Alert manager */}
        {this.state.alerts.map((d: IAlert) =>
          <Alert message={d.message} type={d.type} />
        )}

        <div>
          <Input
            value={this.state.search}
            placeholder="Search for anime"
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              this.setState({ search: e.target.value })
            }
          />

          <Button
            color="primary"
            className="button"
            endIcon={<SearchIcon />}
            onClick={this.search}
          >
            Search
          </Button>
        </div>
        <div className="table-container">
          <TableContainer component={Paper}>
            <Table className="table" aria-label="simple table">
              <TableHead>
                <TableRow>
                  <TableCell>Title</TableCell>
                  <TableCell align="right">Year</TableCell>
                  <TableCell align="right">Episodes</TableCell>
                  <TableCell align="right">Score</TableCell>
                  <TableCell align="right">Status</TableCell>
                  <TableCell align="right">Type</TableCell>
                  <TableCell align="right">Rated</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {this.state.animeList
                  .filter((row: Anime) => !this.state.onlyMatches ||
                    row.title.toLowerCase().includes(this.state.searchPhrase.toLowerCase()))
                  .map((row: Anime) => (
                    <TableRow key={row.title}>
                      <TableCell component="th" scope="row">
                        {row.title}
                      </TableCell>
                      <TableCell align="right">{row.year ? row.year : 'TBA'}</TableCell>
                      <TableCell align="right">{row.episodes ? row.episodes : 'TBA'}</TableCell>
                      <TableCell align="right">{row.score ? row.score : 'N/A'}</TableCell>
                      <TableCell align="right">{row.status}</TableCell>
                      <TableCell align="right">{row.type}</TableCell>
                      <TableCell align="right">{row.rated}</TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </TableContainer>
        </div>
      </div>
    );
  }
}

export default App;
