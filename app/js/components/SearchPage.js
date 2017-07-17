import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { Map } from 'immutable';

import LikeCard from '../components/LikeCard';
import SearchBar from '../components/SearchBar';

import { doesDislike, doesLike } from '../utils/likingUtils';

export default class SearchPage extends Component {
  static get propTypes() {
    return {
      accountLoading: PropTypes.bool.isRequired,
      dislike: PropTypes.func.isRequired,
      getLikeData: PropTypes.func.isRequired,
      like: PropTypes.func.isRequired,
      searchResult: PropTypes.shape({
        dislikes: PropTypes.number.isRequired,
        entityId: PropTypes.string.isRequired,
        likes: PropTypes.number.isRequired,
        myRating: PropTypes.number.isRequired,
      }).isRequired,
      unDislike: PropTypes.func.isRequired,
      unLike: PropTypes.func.isRequired,
    };
  }

  constructor(props, context) {
    super(props, context);

    this.state = {
      activeAccount: null,
      pendingLikes: Map(),
      searchInput: '',
    };

    this.handleInputChange = this.handleInputChange.bind(this);
    this.handleDislikeClick = this.handleDislikeClick.bind(this);
    this.handleLikeClick = this.handleLikeClick.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.onAccountSwitch = this.onAccountSwitch.bind(this);
    this.onLikeEvent = this.onLikeEvent.bind(this);
  }

  componentDidMount() {
    const { getLikeData, searchResult: { entityId } } = this.props;
    getLikeData(entityId);
  }

  isDislikePending() {
    const { pendingLikes } = this.state;
    const { searchResult: { entityId } } = this.props;

    return !!(pendingLikes.getIn([entityId, 'dislike'])
    || pendingLikes.getIn([entityId, 'unDislike']));
  }

  isLikePending() {
    const { pendingLikes } = this.state;
    const { searchResult: { entityId } } = this.props;

    return !!(pendingLikes.getIn([entityId, 'like'])
    || pendingLikes.getIn([entityId, 'unLike']));
  }

  onAccountSwitch(activeAccount) {
    const { getLikeData, searchResult: { entityId } } = this.props;
    this.setState({ activeAccount });
    getLikeData(entityId);
  }

  onLikeEvent(entityId) {
    const { pendingLikes } = this.state;
    const {
      getLikeData,
      searchResult: {
        entityId: currentEntityId,
      },
    } = this.props;
    this.setState({ pendingLikes: pendingLikes.delete(entityId) });
    if (entityId === currentEntityId) {
      getLikeData(entityId);
    }
  }

  handleInputChange({ target: { value } }) {
    this.setState({
      searchInput: value,
    });
  }

  handleDislikeClick() {
    const { pendingLikes } = this.state;
    const { dislike, searchResult: { entityId, myRating }, unDislike } = this.props;

    if (doesDislike(myRating)) {
      this.setState({
        pendingLikes: pendingLikes.setIn([entityId, 'unDislike'], true),
      });
      unDislike(entityId);
    } else {
      this.setState({
        pendingLikes: pendingLikes.setIn([entityId, 'dislike'], true),
      });
      dislike(entityId);
    }
  }

  handleLikeClick() {
    const { pendingLikes } = this.state;
    const { like, searchResult: { entityId, myRating }, unLike } = this.props;

    if (doesLike(myRating)) {
      this.setState({
        pendingLikes: pendingLikes.setIn([entityId, 'unLike'], true),
      });
      unLike(entityId);
    } else {
      this.setState({
        pendingLikes: pendingLikes.setIn([entityId, 'like'], true),
      });
      like(entityId);
    }
  }

  handleSubmit(event) {
    event.preventDefault();
    this.props.getLikeData(this.state.searchInput);
  }

  render() {
    const { searchInput } = this.state;
    const { searchResult: { dislikes, entityId, likes, myRating } } = this.props;

    return (
      <div>
        <SearchBar
          onInputChange={this.handleInputChange}
          onSubmit={this.handleSubmit}
          searchInput={searchInput}
        />
        {entityId && (
          <LikeCard
            dislikes={dislikes}
            entityId={entityId}
            isDislikePending={this.isDislikePending()}
            isLikePending={this.isLikePending()}
            likes={likes}
            myRating={myRating}
            onDislikeClick={this.handleDislikeClick}
            onLikeClick={this.handleLikeClick}
          />
        )}
      </div>
    );
  }
}
