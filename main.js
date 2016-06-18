const msg = {
  controls: {
    timeInput: (time) => `${time} seconds`,
    start: 'Start time',
    styles: {
      clock: 'Clock',
      fill: 'Fill screen'
    }
  },
  end: 'End',
  time: (time) => `${time} sec`
}

class Timer extends React.Component {
  constructor(props) {
    super(props)
    console.log(msg)
    this.state = {
      leftTime: this.props.time,
      running: false,
      time: this.props.time,
      radius: Math.floor(window.innerHeight / ((1 + Math.sqrt(5)) / 2) / 2),
      style: this.props.style,
    }
  }

  updateTimer() {
    if (this.state.leftTime === 0) {
      clearInterval(this.timerRef)
      this.timerRef = null
      this.setState({
        leftTime: this.state.time,
        running: false,
      })
    } else {
      this.setState({leftTime: this.state.leftTime - 1})
    }
  }

  startTimer() {
    if (!this.timerRef) {
      this.timerRef = setInterval(this.updateTimer.bind(this), 1000)
      this.setState({running: true})
    }
  }

  render() {
    const props = {
      left: this.state.leftTime,
      total: this.state.time,
      threshold: this.props.threshold,
    }
    let visual = this.state.style === 'clock'
      ? <Clock
          radius={this.state.radius}
          {...props}
        />
      : <Fill
          {...props}
        />

    return (
      <div style={{height: '100vh'}}>
        {this.state.running ?
          visual
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
                type="number"
                inputmode="numeric"
                min={1}
                placeholder={`${this.state.time} seconds`}
                onChange={(e) => {
                    const time = parseInt(e.target.value) || 0
                    this.setState({time: time, leftTime: time})
                  }
                }
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
            <div>
              <button onClick={this.startTimer.bind(this)}>
                {msg.controls.start}
              </button>
            </div>
            <p style={{color: 'var(--light-color)', fontWeight: '400', fontSize: '2em', marginTop: 'auto'}}>
              Created by <a href="https://github.com/darjanin">Milan Darjanin</a> in 2016
            </p>
          </div>
        }
      </div>
    )
  }
}

const Clock = ({radius, left, total, threshold}) => {
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
            style={
              {strokeDasharray: `${2 * radius * Math.PI * ratio} ${2 * radius * Math.PI * (1 - ratio)}`}
            }
          />
        </svg>
        <div
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: 0,
            bottom: 0,
            color: `var(${left / total > 0.5 ? '--light-color' : '--dark-color'})`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '15em',
            transition: 'color 1s',
          }}
        >
          {left <= threshold && left}
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
          color: `var(${left / total > 0.5 ? '--light-color' : '--dark-color'})`,
          bottom: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '30em',
          transition: 'color 1s',
        }}
      >
        {left <= threshold && left}
      </div>
    </div>
  )
}

// TODO if threshold is not specified than it's equal to time
ReactDOM.render(
  <Timer time={6} threshold={6} style="clock"/>,
  document.getElementById('app')
);
