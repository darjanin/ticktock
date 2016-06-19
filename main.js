const msg = {
  helpers: {
    plural: (word, count) => count > 1 ? `${word}s` : word
  },
  controls: {
    timeInput: (time) => `${time} seconds`,
    start: 'Start time',
    styles: {
      clock: 'Clock',
      fill: 'Fill screen'
    }
  },
  timeLeft: (time) => time > 0 ? `${time}` : 'End',
  time: (time) => {
    const {helpers: {plural}} = msg
    const m = Math.floor(time / 60)
    const s = time % 60
    return `${m > 0 ? `${m} ${plural('minute', m)} ` : ''}${s} ${plural('second', s)}`
  }
}

class Timer extends React.Component {
  constructor(props) {
    super(props)
    console.log(msg)
    this.state = {
      leftTime: this.props.time,
      running: false,
      paused: false,
      time: this.props.time,
      style: this.props.style,
    }
  }

  componentDidMount() {
    window.addEventListener('keypress', (e) => {
      if (this.state.running && (e.keyCode === 0 || e.keyCode === 32)) {
        this.setState({paused: !this.state.paused})
      } else if (!this.state.running && (e.keyCode === 13)) {
        this.startTimer()
      }
    })
  }

  updateTimer() {
    if (this.state.leftTime === 0) {
      this.stopTimer()
    } else {
      if (!this.state.paused) {
        this.setState({leftTime: this.state.leftTime - 1})
      }
    }
  }

  stopTimer() {
    if (this.timerRef) {
      clearInterval(this.timerRef)
      this.timerRef = null
      this.setState({
        leftTime: this.state.time,
        running: false,
      })
    }
  }

  startTimer() {
    if (!this.timerRef) {
      this.timerRef = setInterval(this.updateTimer.bind(this), 1000)
      this.setState({running: true, paused: false,})
    }
  }

  restartTimer() {
    if (this.timerRef) {
      this.stopTimer()
      this.startTimer()
    }
  }

  setTime(e) {
    const regexp = /\d+\ *[m|s]/g
    const timeComponents = e.target.value.match(regexp)
    const time = timeComponents ? timeComponents.reduce((total, component) => {
      if (component.indexOf('m') !== -1) return total + parseInt(component) * 60
      else if (component.indexOf('s') !== -1) return total + parseInt(component)
      return total + 0;
    }, 0) : 0
    this.setState({time: time, leftTime: time})
  }

  render() {
    const props = {
      left: this.state.leftTime,
      total: this.state.time,
      threshold: Math.floor(this.state.time * 0.4),
    }
    let visual = this.state.style === 'clock'
      ? <Clock {...props} />
      : <Fill {...props} />

    return (
      <div style={{height: '100vh'}}>
        {this.state.running ?
          <div
            style={{
              height: '100%',
              position: 'relative',
              cursor: this.state.running && !this.state.paused ? 'none' : 'default',
            }}
            onClick={() => {this.setState({paused: !this.state.paused})}}
          >
            {visual}
            {this.state.paused && <div
              style={{
                position: 'absolute',
                top: 0,
                bottom: 0,
                left: 0,
                right: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              className="overlay"
            >
              <div>
                <p>Total time: {msg.time(this.state.time)}</p>
                <p>Left time: {msg.time(this.state.leftTime)}</p>
                <button onClick={() => {this.setState({paused: !this.state.paused})}}>Resume</button>
                <button onClick={this.restartTimer.bind(this)}>Restart</button>
                <button onClick={this.stopTimer.bind(this)}>Stop</button>
              </div>
            </div>}
          </div>
          :
          <div style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              height: '100%',
              flexDirection: 'column',
            }}>
            <h1 style={{color: 'var(--light-color)', fontSize: '4em', marginTop: 'auto'}}>Tick, Tock, &hellip;</h1>
            <div style={{marginBottom: '2rem'}}>
              <input
                type="text"
                placeholder={msg.time(this.state.time)}
                onChange={this.setTime.bind(this)}
              />
              {
                ['clock', 'fill'].map((style) => (
                  <button
                    key={style}
                    onClick={() => this.setState({style: style})}
                    className={this.state.style === style ? 'active' : ''}
                  >
                    {msg.controls.styles[style]}
                  </button>
                ))
              }
            </div>
            <div style={{textAlign: 'center'}}>
              <button onClick={this.startTimer.bind(this)} className="startButton">
                {msg.controls.start}
              </button>
              <p className="note">NOTE: To pause click anywhere or press <kbd>Space</kbd> while running.</p>
              <p className="note">NOTE2: Press <kbd>Return</kbd> to start timer.</p>
            </div>
            <p style={{color: 'var(--light-color)', fontWeight: '400', fontSize: '2em', marginTop: 'auto'}}>
              Created by <a href="https://github.com/darjanin">Milan Darjanin</a>. Enjoy using.
            </p>
          </div>
        }
      </div>
    )
  }
}

const Clock = ({left, total, threshold}) => {
  const radius = Math.floor(window.innerHeight / ((1 + Math.sqrt(5)) / 2) / 2)
  const ratio = 1 - left / total

  return (
    <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%'}}>
      <div style={{position: 'relative'}}>
        <svg width={radius * 2} height={radius * 2} className="chart">
          <circle
            r={radius}
            cx={radius}
            cy={radius}
            strokeWidth={2 * radius}
            style={{
              strokeDasharray: `${2 * radius * Math.PI * ratio} ${2 * radius * Math.PI * (1 - ratio)}`,
              stroke: ratio === 0 ? 'transparent' : 'var(--light-color)',
            }}
          />
        </svg>
        <div
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: 0,
            bottom: 0,
            color: 'black' || `var(${left / total > 0.5 ? '--light-color' : '--dark-color'})`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '15em',
            transition: 'color 1s',
          }}
        >
          {left <= threshold && msg.timeLeft(left)}
        </div>
      </div>
    </div>
  )
}

const Fill = ({left, total, threshold}) => {
  return (
    <div style={{position: 'relative', height: '100vh'}}>
      <div
        style ={{
          position: 'absolute',
          top: 0,
          left: 0,
          bottom: 0,
          backgroundColor: 'var(--light-color)',
          width: `${100 - (left / total * 100)}%`,
          transition: 'width .25s linear',
        }}
      />

      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: 0,
          color: 'black' || `var(${left / total > 0.5 ? '--light-color' : '--dark-color'})`,
          bottom: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '30em',
          transition: 'color 1s',
        }}
      >
        {left <= threshold && msg.timeLeft(left)}
      </div>
    </div>
  )
}

ReactDOM.render(
  <Timer time={61} style="clock"/>,
  document.getElementById('app')
);
