// https://cdnjs.cloudflare.com/ajax/libs/preact/8.2.6/preact.js


/** @jsx h */
const { h, render, Component } = window.preact;

/**********************************
* Utils
**********************************/
const utils = {
    getLayerX(node, clientX) {
        let el = node;
        let x = 0;
        
        while (el && !isNaN(el.offsetLeft) && !isNaN(el.offsetTop)) {
            x += el.offsetLeft - el.scrollLeft;
            el = el.offsetParent;
        }
        
        return clientX - x;
    },
    
    getRandomNumInRange(min, max) {
        return Math.floor(Math.random() * (max - min) + min);
    },
    
    formatTime(time) {
        const hours = Math.floor(time / 3600);
        const minutes = Math.floor((time % 3600) / 60);
        const seconds = time % 60;
        let formatted = '';
        
        if (hours > 0) {
            formatted += `${hours}:${minutes < 10 ? '0' : ''}`;
        }
        
        formatted += `${minutes}:${seconds < 10 ? '0' : ''}`;
        formatted += seconds;
        return formatted;
    },
}

/**********************************
* State Machine
**********************************/

const stateMachine = {
    initialState: 'fetching',
    fetching: {
        REJECTED: 'error',
        SUCCESS: 'stopped',
    },
    buffering: {
        READY: 'stopped',
        PROCEED: 'playing',
        FAILED: 'error',
    },
    playing: {
        STOP: 'stopped',
        LOADING: 'buffering',
        FAILED: 'error',
    },
    stopped: {
        PLAY: 'playing',
        LOADING: 'buffering',
        FAILED: 'error',
    },
    error: {
        RELOAD: 'fetching',
    },
};

/**********************************
* Base Melody Component
**********************************/

class Melody extends Component {
    state = {
        currentState: '',
        lastState: '',
        tracks: [],
        currentTrack: null,
        shuffle: false,
        repeat: false,
        volume: 0.5,
        currentTime: 0,
        gliderIsDragging: false,
        volIsDragging: false,
        endpoint: '',
    };

    AudioInterface;

    constructor(props) {
        super(props);
        this.AudioInterface = new window.Audio();
        this.AudioInterface.volume = 0.5;
        const { initialState } = props.stateMachine;
        this.setState({
            currentState: initialState,
            endpoint: props.endpoint,
        }, this.fetchTracks);
    }

    componentDidMount() {
        this.AudioInterface.addEventListener('waiting', this.onInterfaceBuffering);
        this.AudioInterface.addEventListener('canplay', this.onCanPlay);
        this.AudioInterface.addEventListener('timeupdate', this.onTimeUpdate);
        this.AudioInterface.addEventListener('ended', this.nextTrack);
    }

    componentWillUnmount() {
        this.AudioInterface.removeEventListener('waiting', this.onInterfaceBuffering);
        this.AudioInterface.removeEventListener('canplay', this.onCanPlay);
        this.AudioInterface.removeEventListener('timeupdate', this.onTimeUpdate);
        this.AudioInterface.removeEventListener('ended', this.nextTrack);
    }

    transition(action) {
        const { currentState } = this.state;        
        const { stateMachine } = this.props;
        const nextState = stateMachine[currentState][action];

        if (!nextState) {
            if (currentState === 'error') {
                return;
            }
            
            this.transition('FAILED');
            return;
        }
        
        switch (nextState) {
            case 'fetching':
            case 'stopped':
            case 'error': {
                this.AudioInterface.pause();
                break;
            }
            case 'playing': {
                this.AudioInterface.play()
                    .catch((e) => {
                        if (e.name && e.name !== 'AbortError') {
                            this.transition('FAILED');
                        }
                    });
                break;
            }
            case 'buffering': {
                break;
            }
            default: {
                // stop if the state is unknown?
                this.AudioInterface.pause();
                break;
            }
        };
        
        this.setState({
            currentState: nextState,
            lastState: currentState,
        });
    }

    onInterfaceBuffering = () => {
        this.transition('LOADING');
    }
    
    onCanPlay = () => {
        const { currentState, lastState } = this.state;
        
        if (currentState !== 'buffering') {
            return;
        }
        
        if (lastState === 'playing') {
            this.transition('PROCEED');
            return;
        }

        this.transition('READY');
    }

    fetchTracks() {
        const { endpoint } = this.state;
        let timer = 0;
        
        const intId = setInterval(() => {
            if (timer > 5) {
                this.transition('REJECTED');
                clearInterval(intId);
                return;
            }
            timer++;
        }, 1000);
        
        window.fetch(endpoint)
            .then(res => res.json())
            .then(tracks => {
                clearInterval(intId);
                this.setState({
                    tracks,
                    currentTrack: 0,
                }, this.setSource);
            this.transition('SUCCESS');
            })
            .catch(() => this.transition('REJECTED'));
    }

    setSource() {
        const { currentState, currentTrack, tracks } = this.state;
        const nextSource = tracks[currentTrack].source_url;
        
        if (this.AudioInterface.src === nextSource) {
            return;
        }
        
        if (currentState === 'playing') {
            this.transition('STOP');
            this.AudioInterface.src = nextSource;
            this.AudioInterface.load();
            this.transition('PLAY');
        } else {
            this.AudioInterface.src = nextSource;
            this.AudioInterface.load();
        }
        // this.transition('STOP'); // uncomment this to view error state
    }

    nextTrack = () => {
        const { tracks, currentTrack, shuffle } = this.state;
        
        if (tracks.length <= 1) {
            return;
        }
        
        if (shuffle) {
            this.shuffleTracks();
            return;
        }
        
        let index = currentTrack + 1;
        if (index > (tracks.length -1)) {
            index = 0;
        }
        
        this.setState({
            currentTrack: index,
        }, this.setSource);
    };

    prevTrack = () => {
        const { tracks, currentTrack, shuffle } = this.state;
        
        if (tracks.length <= 1) {
            return;
        }
        
        let index = currentTrack - 1;
        
        if (index < 0) {
            index = tracks.length - 1;
        }
        
        this.setState({
            currentTrack: index,
        }, this.setSource);
    };

    shuffleTracks() {
        const { tracks, currentTrack } = this.state;
        let index = utils.getRandomNumInRange(0, tracks.length);
        
        while (index === currentTrack) {
            index = utils.getRandomNumInRange(0, tracks.length);
        }
        
        this.setState({
            currentTrack: index,
        });
    }

    toggleShuffle = () => {
        const { shuffle } = this.state;
        this.setState({
            shuffle: !shuffle,
        });
        return;
    }

    toggleRepeat = () => {
        const { repeat } = this.state;
        this.AudioInterface.loop = !repeat;
        this.setState({
            repeat: !repeat,
        });
    }

    toggleFav = () => {
        const { currentTrack, tracks } = this.state;
        const track = tracks[currentTrack];
        track.favorite = track.favorite ? !track.favorite : true;
        this.setState({ tracks });
    };

    toggleGliderDragging = () => {
        const { gliderIsDragging } = this.state;
        this.setState({
            gliderIsDragging: !gliderIsDragging,
        });
    }
    
    toggleVolDragging = () => {
        const { volIsDragging } = this.state;
        this.setState({
            volIsDragging: !volIsDragging,
        });
    }

    updateVolume = (newVolume) => {
        if (isNaN(newVolume)) {
            return;
        }
        
        const { volume } = this.state;
        
        if (newVolume === volume) {
            return;
        }

        this.AudioInterface.volume = newVolume;
        this.setState({ volume: newVolume }); 
    };
    
    onTimeUpdate = () => {
        const nextTime = this.AudioInterface.currentTime.toFixed(0);
        const { currentTime, gliderIsDragging } = this.state;
        
        if (nextTime === currentTime || gliderIsDragging) {
            return;
        }

        this.setState({
            currentTime: nextTime,
        });
    }
    
    setCurrentTime = (nextTime, updateInterface = true) => {
        this.setState({
            currentTime: nextTime,
        });
        
        if (updateInterface) {
            this.AudioInterface.currentTime = nextTime;
        }
    }

    render({ }, { currentState, gliderIsDragging, volIsDragging }) {
        const isDragging = gliderIsDragging || volIsDragging;
        const classes = {
            default: `melody__component melody__component--${currentState}`,
            dragging: 'melody__component--isDragging',
        }
        
        return (
            <div class={isDragging ? `${classes.default} ${classes.dragging}` : classes.default}>
                {this[currentState]()}
            </div>
        );
    }

    fetching() {
        // show loader
        return null;
    }

    buffering() {
        const {
            currentState,
            shuffle,
            repeat,
            tracks,
            currentTrack,
            volume,
            currentTime,
        } = this.state;
        return (
            <div class="melody__stateContainer">
                <Preview
                    track={tracks[currentTrack]}
                    toggleFav={this.toggleFav}
                    volume={volume}
                    updateVolume={this.updateVolume}
                    currentTime={currentTime}
                    setCurrentTime={this.setCurrentTime}
                    currentState={currentState}
                    toggleGliderDragging={this.toggleGliderDragging}
                    toggleVolDragging={this.toggleVolDragging}
                 />
                <ControlBar
                    currentState={currentState}
                    toggleRepeat={this.toggleRepeat}
                    toggleShuffle={this.toggleShuffle}
                    shuffle={shuffle}
                    repeat={repeat}
                    next={this.nextTrack}
                    prev={this.prevTrack}
                    transition={() => this.transition('PLAY')}
                />
            </div>
        );
    }

    playing() {
        const {
            currentState,
            shuffle,
            repeat,
            tracks,
            currentTrack,
            volume,
            currentTime,
        } = this.state;
        return (
            <div class="melody__stateContainer">
                <Preview
                    track={tracks[currentTrack]}
                    toggleFav={this.toggleFav}
                    volume={volume}
                    updateVolume={this.updateVolume}
                    currentTime={currentTime}
                    setCurrentTime={this.setCurrentTime}
                    currentState={currentState}
                    toggleGliderDragging={this.toggleGliderDragging}
                    toggleVolDragging={this.toggleVolDragging}
                />
                <ControlBar
                    currentState={currentState}
                    toggleRepeat={this.toggleRepeat}
                    toggleShuffle={this.toggleShuffle}
                    shuffle={shuffle}
                    repeat={repeat}
                    next={this.nextTrack}
                    prev={this.prevTrack}
                    transition={() => this.transition('STOP')}
                />
            </div>
        );
    }

    stopped() {
        const {
            currentState,
            shuffle,
            repeat,
            tracks,
            currentTrack,
            volume,
            currentTime,
        } = this.state;
        return (
            <div class="melody__stateContainer">
                <Preview
                    track={tracks[currentTrack]}
                    toggleFav={this.toggleFav}
                    volume={volume}
                    updateVolume={this.updateVolume}
                    currentTime={currentTime}
                    setCurrentTime={this.setCurrentTime}
                    currentState={currentState}
                    toggleGliderDragging={this.toggleGliderDragging}
                    toggleVolDragging={this.toggleVolDragging}
                 />
                <ControlBar
                    currentState={currentState}
                    toggleRepeat={this.toggleRepeat}
                    toggleShuffle={this.toggleShuffle}
                    shuffle={shuffle}
                    repeat={repeat}
                    next={this.nextTrack}
                    prev={this.prevTrack}
                    transition={() => this.transition('PLAY')}
                />
            </div>
        );
    }

    error() {
        return (
            <div class="melody__errorContainer">
                <svg class="melody__icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 240">
                    <path d="m110 150 20 0 0 20-20 0zm0-80 20 0 0 60-20 0zm9.9-50C64.7 20 20 64.8 20 120 20 175.2 64.7 220 119.9 220 175.2 220 220 175.2 220 120 220 64.8 175.2 20 119.9 20Zm0.1 180c-44.2 0-80-35.8-80-80 0-44.2 35.8-80 80-80 44.2 0 80 35.8 80 80 0 44.2-35.8 80-80 80z"/>
                </svg>
                <p class="melody__body">Something went wrong!</p>
                <BaseButton onClick={window.location.reload.bind(window.location)} className="melody__reloadBtn">
                    Reload
                </BaseButton>
            </div>
        );
    }
}

/**********************************
* Drag Helper HOC
**********************************/

const DragHelper = (WrappedComponent) => {
    return class extends Component {
        state = {
            isDragging: false,
            initX: 0,
            initY: 0,
        }
    
        ref;
        
        registry = new Map();
        
        componentDidMount() {
            this.ref.addEventListener('mousedown', this.initDragEvent);
            this.ref.addEventListener('mousedown', this.fire);
            document.addEventListener('mousemove', this.fire);
            document.addEventListener('mouseup', this.endDragEvent);
            document.addEventListener('mouseup', this.fire);
            this.ref.addEventListener('touchstart', this.initDragEvent);
            this.ref.addEventListener('touchstart', this.fire);
            this.ref.addEventListener('touchmove', this.fire);
            this.ref.addEventListener('touchend', this.endDragEvent);
            this.ref.addEventListener('touchend', this.fire);
        }
        
        componentWillUnmount() {
            this.ref.removeEventListener('mousedown', this.initDragEvent);
            this.ref.removeEventListener('mousedown', this.fire);
            document.removeEventListener('mousemove', this.fire);
            document.removeEventListener('mouseup', this.endDragEvent);
            document.removeEventListener('mouseup', this.fire);
            this.ref.removeEventListener('touchstart', this.initDragEvent);
            this.ref.removeEventListener('touchstart', this.fire);
            this.ref.removeEventListener('touchmove', this.fire);
            this.ref.removeEventListener('touchend', this.endDragEvent);
            this.ref.removeEventListener('touchend', this.fire);
        }
    
        setDragRef = (ref) => {
            this.ref = ref;
        }
        
        initDragEvent = (e) => {
            if (e.which === 3) {
                return;
            }
            
            let initX;
            let initY;
            
            if (e.touches) {
                initX = e.touches[0].clientX;
                initY = e.touches[0].clientY;
            } else {
                initX = e.clientX;
                initY = e.clientY;
            }
            
            this.setState({
                isDragging: true,
                initX,
                initY,
            });
        }
        
        endDragEvent = (e) => {
            if (!this.state.isDragging) {
                return;
            }
            
            let x;
            let y;
            
            if (e.changedTouches) {
                x = e.changedTouches[0].clientX;
                y = e.changedTouches[0].clientY;
            } else {
                x = e.clientX;
                y = e.clientY;
            }

            const { initX, initY } = this.state;
            
            if (initX !== x || initY !== y) {
                this.fire(e);
            }
            
            this.setState({
                isDragging: false,
            });
        }
    
        on(fn, ...events) {
            events.map(event => {
                if (this.registry.has(event)) {
                    const handlers = this.registry.get(event);
                    
                    if (handlers.has(fn)) {
                        return;
                    }
                    
                    handlers.add(fn);
                    return;
                }
                
                this.registry.set(event, new Set([fn]));
            });
        }
    
        fire = (e) => {
            if (!this.state.isDragging) {
                return;
            }
            
            const { type } = e;
            
            if (this.registry.has(type)) {
                let eventData = e;
                
                switch (type) {
                    case 'touchstart':
                    case 'touchmove': {
                        eventData = e.touches[0];
                        break;
                    }
                    case 'touchend': {
                        eventData = e.changedTouches[0];
                        break;
                    }
                    default: {
                        eventData = e;
                        break;
                    }
                }
                
                this.registry.get(type).forEach(fn => fn.call(WrappedComponent, eventData));
            }
        }
        
        render() {
            return (
                <WrappedComponent
                    setDragRef={this.setDragRef}
                    onDragStart={fn => this.on(fn, 'mousedown', 'touchstart')}
                    onDrag={fn => this.on(fn, 'mousemove', 'touchmove')}
                    onDragEnd={fn => this.on(fn, 'mouseup', 'touchend')}
                    isDragging={this.state.isDragging}
                    {...this.props}
                />
            );
        }
    }
}

/**********************************
* Control Bar
**********************************/

const ControlBar = (props) => {
    const {
        currentState,
        toggleRepeat,
        toggleShuffle,
        shuffle,
        repeat,
        next,
        prev,
        transition,
    } = props;
    
    const classNames = {
        default: 'melody__playbackCtrl',
        active: 'melody__playbackCtrl melody__playbackCtrl--active',
    };
    return (
        <div class="melody__controlBar">
            <BaseButton
                key="shuffle"
                className={shuffle ? classNames.active : classNames.default}
                onClick={toggleShuffle}
            >
                <Icon name="shuffle" />
            </BaseButton>
            <BaseButton
                key="skipBack"
                className={classNames.default}
                onClick={prev}
            >
                <Icon name="skipBack" />
            </BaseButton>
            {currentState === 'buffering' ?
                <div class="melody__buffer melody__playbackCtrl melody__playbackCtrl--cc">
                    <Icon name="buffer" />
                </div>
                :
                <BaseButton
                    key="catalyst"
                    onClick={transition}
                    className="melody__playbackCtrl melody__playbackCtrl--cc"
                >
                    <Icon name={currentState !== 'playing' ? 'play' : 'pause'} />
                </BaseButton>   
            }
            <BaseButton
                key="skipForward"
                className={classNames.default}
                onClick={next}
            >
                <Icon name="skipForward" />
            </BaseButton>
            <BaseButton
                key="repeat"
                onClick={toggleRepeat}
                className={repeat ? classNames.active : classNames.default}
            >
                <Icon name="repeat" />
            </BaseButton>
        </div>
    );
}

/**********************************
* Preview
**********************************/

const Preview = (props) => {
    const {
        toggleFav,
        track,
        volume,
        updateVolume,
        currentTime,
        setCurrentTime,
        currentState,
        toggleGliderDragging,
        toggleVolDragging,
    } = props;
    
    const {
        artist,
        title,
        length: duration,
    } = track.media_details;
    const favorited = track.favorite || false;
    
    const getArtwork = () => {
        const { artwork } = track;
        const style = {
            backgroundImage: 'url(https://source.unsplash.com/random/350X300)',
        };
        
        if (artwork) {
            style.backgroundImage = `url(${artwork})`;
        }
        
        return style;
    }
    
    return (
        <div class="melody__preview">
            <div style={getArtwork()} class="melody__artwork"></div>
            <PreviewHeader
                favorited={favorited}
                toggleFav={toggleFav}
                volume={volume}
                updateVolume={updateVolume}
                toggleVolDragging={toggleVolDragging}
            />
            <div class="melody__marquee">
                <h1 class="melody__title">{title}</h1>
                <p class="melody__body">{artist}</p>
            </div>
            <DragGlider
                duration={duration}
                currentTime={currentTime}
                setCurrentTime={setCurrentTime}
                currentState={currentState}
                toggleGliderDragging={toggleGliderDragging}
            />
            <PreviewFooter
                duration={duration}
                currentTime={currentTime}
            />
        </div>
    );
}

/**********************************
* Preview Header
**********************************/

const PreviewHeader = (props) => {
    const {
        favorited,
        toggleFav,
        volume,
        updateVolume,
        toggleVolDragging,
    } = props;
    
    return (
        <div class="melody__previewHeader">
            <FavoriteBtn
                toggle={toggleFav}
                favorite={favorited}
            />
            <DragVolumeCtrl
                level={volume}
                updateVolume={updateVolume}
                toggleVolDragging={toggleVolDragging}
            />
        </div>
    );
}

/**********************************
* Favorite Button
**********************************/

class FavoriteBtn extends Component {
    state = {
        animate: false,
    }

    componentWillReceiveProps(nextProps) {
        const { animate } = this.state;
        if (!nextProps.favorite && animate) {
            this.setState({
                animate: false,
            });
        }
    }

    handleClick = () => {
        this.props.toggle();
        this.setState({
           animate: true, 
        });
    }
    
    getClasses() {
        const { favorite } = this.props;
        const { animate } = this.state;
        const classes = {
            default: 'melody__favCtrl',
            active: 'melody__favCtrl--active',
            animate: 'melody__favCtrl--ghost',
        };
        
        let className = classes.default;
        
        if (favorite) {
            className = `${className} ${classes.active}`;
        }
        
        if (animate) {
            className = `${className} ${classes.animate}`;
        }
        
        return className;
    }

    render({ toggle, active }, { animate }) {
        const classes = {
            default: 'melody__favCtrl',
            active: 'melody__favCtrl melody__favCtrl--active',
        };
        return(
            <BaseButton
                onClick={this.handleClick}
                className={this.getClasses()}
            >
                <svg class="melody__icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                </svg>
        </BaseButton>
        );
    }
}

/**********************************
* Volume Control
**********************************/

class VolumeCtrl extends Component {
    state = {
        originalClientY: 0,
        lastClientY: 0,
        lastDirection: null,
    };

    componentDidMount() {
        const { onDragStart, onDrag, onDragEnd, toggleVolDragging } = this.props;
        onDragStart(this.dragStart);
        onDrag(this.setVolume);
        onDragEnd(toggleVolDragging);
    }

    getPath() {
        const { level } = this.props;
        
        if (level < 0.1) {
            return <path d="M7 9v6h4l5 5V4l-5 5H7z"/>;
        }
        
        if (level > 0.1 && level < 0.8) {
            return <path d="M18.5 12c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM5 9v6h4l5 5V4L9 9H5z"/>;
        }
        
        if (level > 0.8) {
            return <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>;
        }
    }

    getDashOffset() {
        const { level } = this.props;
        const ceiling = 75;
        const offset = ceiling - (level * ceiling);
        
        return {
            strokeDashoffset: `${offset}`,
        };
    }

    dragStart = ({ clientY }) => {
        this.props.toggleVolDragging();
        this.setState({
            originalClientY: clientY,
        });
    };

    setVolume = (e) => {
        const { clientY } = e;
        const { lastClientY, lastDirection } = this.state
        let { originalClientY } = this.state;
        
        if (clientY === lastClientY) {
            return;
        }
        
        this.setState({ lastClientY: clientY });
        const direction = lastClientY > clientY ? 'up' : 'down';
        
        if (direction !== null && direction !== lastDirection) {
            originalClientY = clientY;
            this.setState({
                lastDirection: direction,
                originalClientY: clientY,
            });
        }
        
        const { level, updateVolume } = this.props;       
        const maxRange = 3000; // sensitivity
        const delta = originalClientY - clientY;
        const percentChange = (delta / maxRange);
        let newLevel = percentChange + level;
        
        if (newLevel < 0) {
           newLevel = 0; 
           this.setState({
               originalClientY: clientY,
           });
        }
        
        if (newLevel > 1) {
            newLevel = 1;
            this.setState({
                originalClientY: clientY,
            });
        }
        
        updateVolume(newLevel);
    };

    render({ level }) {
        const { setDragRef } = this.props;
        return (
            <div
                class="melody__volume"
                ref={ref => setDragRef(ref)}
            >
                <svg class="melody__icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                    <circle style={this.getDashOffset()} cx="12" cy="12" r="12"/>
                    {this.getPath()}
                </svg>
            </div>
        );
    }
}

const DragVolumeCtrl = DragHelper(VolumeCtrl);

/**********************************
* Preview Footer
**********************************/

const PreviewFooter = ({ duration, currentTime }) => {    
    const formatTime = (time) => {
        if (time > duration) {
            return utils.formatTime(duration);
        }
        
        if (time < 0) {
            return utils.formatTime(0);
        }
        
        return utils.formatTime(time);
    }
    
    return (
        <div class="melody__previewFooter">
            <span class="melody__time">{formatTime(currentTime)}</span>
            <span class="melody__time">{formatTime(duration - currentTime)}</span>
        </div>
    );
}

/**********************************
* Glider
**********************************/

class Glider extends Component {
    state = {
        transitionHandle: false,
        offset: 0,
        clientX: 0,
    }

    ref;

    componentDidMount() {
        const { onDragStart, onDrag, onDragEnd } = this.props;
        onDragStart(this.onDragStart);
        onDrag(this.onDrag);
        onDragEnd(this.onDragEnd);
    }

    componentWillReceiveProps(nextProps) {
        if (this.props.currentTime !== nextProps.currentTime) {
            const { duration, currentTime } = nextProps;
            const nextOffset = (100 / (duration / currentTime)).toFixed(2);
            this.updateOffset(nextOffset);
        }
        
        if (this.props.isDragging !== nextProps.isDragging) {
            this.props.toggleGliderDragging();
        }
    }

    setRef = (el) => {
        if (el instanceof HTMLElement) {
            this.ref = el;
            this.props.setDragRef(el);
        }
    }
    
    updateOffset(nextOffset) {
        this.setState({
            offset: nextOffset,
        });
    }

    handleClick = ({ clientX }, ignoreHandle = true) => {
        if (!this.ref) {
            return;
        }
        
        const width = this.ref.offsetWidth;
        const x = utils.getLayerX(this.ref, clientX);
        
        if (ignoreHandle) {
            const currentOffset = this.state.offset;
            const handleArea = 14;
            const handleSpacing = 2;
            const rightPadding = handleArea / 2;
            const handleCenter = (currentOffset * width) / 100;
            const lowerBoundary = handleCenter - (handleArea + handleSpacing) + rightPadding;
            const upperBoundary = handleCenter + handleArea + handleSpacing;
            const withinHandle = x >= lowerBoundary && x <= upperBoundary;

            if (withinHandle) {
                return;
            } 
        }
          
        
        const { duration, setCurrentTime } = this.props;
        const xPercent = 100 / (width / x);
        const updatedTime = ((duration * xPercent) / 100).toFixed(0);
        setCurrentTime(updatedTime);
    }
    
    onDragStart = ({ clientX }) => {        
        this.setState({
            clientX,
        });
    };

    onDragEnd = (e) => {
        this.handleClick(e, false);
    }

    onDrag = ({ clientX }) => {
        if (!this.ref) {
            // show error? call func to display error start? transitionComponent?
            return;
        }
        
        const originalClientX = this.state.clientX;
        
        if (clientX === originalClientX) {
            return;
        }
        
        const { offset } = this.state;
        const { duration, setCurrentTime } = this.props;
        const width = this.ref.offsetWidth;
        const x = utils.getLayerX(this.ref, clientX);
        let newOffset = Number(((x / width) * 100).toFixed(2));
        
        if (newOffset > 100) {
            newOffset = 100;
        }
        
        if (newOffset < 0) {
            newOffset = 0;
        }
        
        this.updateOffset(newOffset);
        
        const updatedTime = ((duration * newOffset) / 100).toFixed(0);
        setCurrentTime(updatedTime, false);
    }
    
    render({ currentState, isDragging }, { offset }) {
        const { setDragRef } = this.props;
        const classes = {
            default: 'melody__glider__trackbar',
            transition: 'melody__glider__trackbar melody__glider__trackbar--transition',
        };
        const handleClass = currentState === 'playing' && offset > 0 && !isDragging ? classes.transition : classes.default;
        return (
            <div 
                ref={this.setRef}
                class="melody__glider"
                onMousedown={this.handleClick}
            >
                <div class="melody__glider__playback">
                    <div className={handleClass} style={{marginLeft: `${offset}%`}}>
                        <div class="melody__glider__handle"/>
                    </div>
                </div>
            </div>
        );
    }
}

const DragGlider = DragHelper(Glider);

/**********************************
* Base Button
**********************************/

const BaseButton = (props) => (
    <button
        {...props}
        class={`melody__btn ${props.className || ''}`}
     >
        {props.children}
    </button>
);

/**********************************
* Icon
**********************************/

const Icon = ({ name, className }) => {
    const getMarkup = (name) => {
        switch(name) {
            case 'shuffle': {
                return <path d="M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4z"/>;
            }
            case 'skipBack': {
                return <path d="M11 18V6l-8.5 6 8.5 6zm.5-6l8.5 6V6l-8.5 6z"/>;  
            }
            case 'play': {
                return <path d="M8 5v14l11-7z"/>; 
            }
            case 'pause': {
                return <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>;
            }
            case 'skipForward': {
                return <path d="M4 18l8.5-6L4 6v12zm9-12v12l8.5-6L13 6z"/>;
            }
            case 'repeat': {
                return <path d="M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z"/>;
            }
            case 'buffer': {
                return (
                    <g>
                        <circle cx="4" cy="13" r="2" />
                        <circle cx="12" cy="13" r="2" />
                        <circle cx="20" cy="13" r="2" />
                    </g>
                );
            }
            default: {
                return '';
            }
        }
    };
    return (
        <svg
            class={`melody__icon ${className || ''}`}
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
        >
            {getMarkup(name)}
        </svg>
    );
}

/**********************************
* Initialization
**********************************/

const endpoint = 'https://jarens.me/wp-json/wp/v2/media?media_type=audio&context=embed';
const melodyRoot = document.getElementById('melody__root');

render(
    <Melody stateMachine={stateMachine} endpoint={endpoint} />,
    melodyRoot,
    melodyRoot.firstChild
);
