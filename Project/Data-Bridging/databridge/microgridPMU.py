# import random
import math

from synchrophasor.frame import ConfigFrame2
from synchrophasor.pmu import Pmu


"""
randomPMU will listen on ip:port for incoming connections.
After request to start sending measurements - random
values for phasors will be sent.
"""

def increase_angle(ang, delta):
    """Increase angle by delta, wrapping around at -pi to pi."""
    ang += delta
    ang = (ang + math.pi) % (2 * math.pi) - math.pi
    return ang

if __name__ == "__main__":

    pmu = Pmu(ip="127.0.0.1", port=20000)
    pmu.logger.setLevel("DEBUG")
    
    ph_v_conversion = int(400 / 65535 * 100000)  # Voltage phasor conversion factor
    ph_i_conversion = int(100 / 32768 * 100000)  # Current phasor conversion factor

    report_rate = 50  # Data rate in Hz

    cfg = ConfigFrame2(
        2,  # PMU_ID (use the port as ID if needed, or set as required)
        1000000,  # TIME_BASE
        3,  # Number of PMUs included in data frame
        ['Station A', 'Station B', 'Station C'],  # Station names
        [1, 2, 3],  # Data-stream ID(s)
        [(True, False, True, False), 
         (True, False, True, False),   # Data format (COORD_TYPE, PHASOR_TYPE, ANALOG_TYPE, FREQ_TYPE)
         (True, False, True, False)],  # TYPE: true = float/polar, false = integer/rectangular.
        [2, 2, 2],  # Number of phasors
        [0, 0, 0],  # Number of analog values
        [0, 0, 0],  # Number of digital status words
        [['Va', 'Ia'], ['Vb', 'Ib'], ['Vc', 'Ic']],  # Channel Names (padded)
        [[(ph_v_conversion, 'v'), (ph_i_conversion, 'i')], 
         [(ph_v_conversion, 'v'), (ph_i_conversion, 'i')], 
         [(ph_v_conversion, 'v'), (ph_i_conversion, 'i')]],  # Phasor units
        [[], [], []],  # Analog units
        [[], [], []],  # Digital units
        [50, 50, 50],  # Nominal frequency
        [0, 0, 0],  # Configuration change count
        report_rate  # Data rate
    )

    va_ang = 0
    vb_ang = -2 * math.pi / 3
    vc_ang = 2 * math.pi / 3
    delfreq = 100  # Frequency deviation in mHz
    delang = delfreq/1000 * 2 * math.pi / report_rate  # Phase angle deviation in radians per report rate

    pmu.set_configuration(cfg)
    pmu.set_header("Hey! I'm randomPMU! Guess what? I'm sending random measurements values!")

    pmu.run()

    while True:
        if pmu.clients:
            va_ang = increase_angle(va_ang, delang)
            vb_ang = increase_angle(vb_ang, delang)
            vc_ang = increase_angle(vc_ang, delang)

            pmu.send_data(
                phasors=[
                    [
                        (220, va_ang),  # Station A, Va
                        (0, 0)    # Station A, Ia
                    ],
                    [
                        (220, vb_ang),  # Station B, Vb
                        (0, 0)   # Station B, Ib
                    ],
                    [
                        (220, vc_ang), # Station C, Vc
                        (0, 0)   # Station C, Ic
                    ]
                ],
                stat=[0, 0, 0],
                analog=[[], [], []],   # No analog values
                digital=[[], [], []],   # No digital values
                freq=[delfreq, delfreq, delfreq],  # frequency
                dfreq=[0, 0, 0] # Rate of change of frequency
            )

    pmu.join()
