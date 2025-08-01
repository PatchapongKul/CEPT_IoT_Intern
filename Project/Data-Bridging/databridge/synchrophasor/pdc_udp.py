import logging
import socket
from sys import stdout
from synchrophasor.frame import *

__author__ = "Stevan Sandi"
__copyright__ = "Copyright (c) 2016, Tomo Popovic, Stevan Sandi, Bozo Krstajic"
__credits__ = []
__license__ = "BSD-3"
__version__ = "1.0.0-alpha"

class PdcUdp(object):

    logger = logging.getLogger(__name__)
    logger.setLevel(logging.INFO)

    handler = logging.StreamHandler(stdout)
    formatter = logging.Formatter("%(asctime)s %(levelname)s %(message)s")
    handler.setFormatter(formatter)
    logger.addHandler(handler)

    def __init__(self, pdc_id=1, pmu_ip="127.0.0.1", pmu_port=4712, buffer_size=2048):
        self.pdc_id = pdc_id
        self.buffer_size = buffer_size
        self.pmu_ip = pmu_ip
        self.pmu_port = pmu_port
        self.pmu_address = (pmu_ip, pmu_port)
        self.pmu_socket = None
        self.pmu_cfg1 = None
        self.pmu_cfg2 = None
        self.pmu_header = None

    def run(self):
        if self.pmu_socket:
            self.logger.info("[%d] - PDC already connected to PMU (%s:%d)", self.pdc_id, self.pmu_ip, self.pmu_port)
        else:
            try:
                # Create UDP socket
                self.pmu_socket = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
                self.logger.info("[%d] - PDC UDP socket created for PMU (%s:%d)",
                                 self.pdc_id, self.pmu_ip, self.pmu_port)
            except Exception as e:
                self.logger.error("[%d] - Error while creating UDP socket for (%s:%d)", self.pdc_id, self.pmu_ip, self.pmu_port)
                self.logger.error(str(e))

    def start(self):
        """
        Request from PMU to start sending data
        :return: NoneType
        """
        start = CommandFrame(self.pdc_id, "start")
        self.pmu_socket.sendto(start.convert2bytes(), self.pmu_address)
        self.logger.info("[%d] - Requesting to start sending from PMU (%s:%d)", self.pdc_id, self.pmu_ip, self.pmu_port)

    def stop(self):
        """
        Request from PMU to stop sending data
        :return: NoneType
        """
        stop = CommandFrame(self.pdc_id, "stop")
        self.pmu_socket.sendto(stop.convert2bytes(), self.pmu_address)
        self.logger.info("[%d] - Requesting to stop sending from PMU (%s:%d)", self.pdc_id, self.pmu_ip, self.pmu_port)

    def get_header(self):
        """
        Request for PMU header message.
        Keeps trying until a valid HeaderFrame is received.
        :return: HeaderFrame
        """
        while True:
            get_header = CommandFrame(self.pdc_id, "header")
            self.pmu_socket.sendto(get_header.convert2bytes(), self.pmu_address)

            self.logger.info("[%d] - Requesting header message from PMU (%s:%d)", self.pdc_id, self.pmu_ip, self.pmu_port)

            header = self.get()
            if isinstance(header, HeaderFrame):
                return header
            else:
                self.logger.warning("[%d] - Invalid Header message received, retrying...", self.pdc_id)

    def get_config(self, version="cfg2"):
        """
        Request for Configuration frame.
        Keeps trying until a valid ConfigFrame is received.
        :param version: string Possible values "cfg1", "cfg2" and "cfg3"
        :return: ConfigFrame
        """
        while True:
            get_config = CommandFrame(self.pdc_id, version)
            self.pmu_socket.sendto(get_config.convert2bytes(), self.pmu_address)

            self.logger.info("[%d] - Requesting config (%s) from PMU (%s:%d)", self.pdc_id, version, self.pmu_ip, self.pmu_port)

            config = self.get()
            if type(config) == ConfigFrame1:
                self.pmu_cfg1 = config
                return config
            elif type(config) == ConfigFrame2:
                self.pmu_cfg2 = config
                return config
            else:
                self.logger.warning("[%d] - Invalid Configuration message received, retrying...", self.pdc_id)

    def get(self):
        """
        Decoding received messages from PMU
        :return: CommonFrame
        """
        received_data = b""
        received_message = None

        # Receive first 4 bytes to get SYNC + FRAMESIZE
        while len(received_data) < 4:
            chunk, _ = self.pmu_socket.recvfrom(self.buffer_size)
            received_data += chunk

        bytes_received = len(received_data)
        total_frame_size = int.from_bytes(received_data[2:4], byteorder="big", signed=False)

        # Keep receiving until every byte of that message is received
        while bytes_received < total_frame_size:
            message_chunk, _ = self.pmu_socket.recvfrom(min(total_frame_size - bytes_received, self.buffer_size))
            if not message_chunk:
                break
            received_data += message_chunk
            bytes_received += len(message_chunk)

        # If complete message is received try to decode it
        if len(received_data) == total_frame_size:
            try:
                received_message = CommonFrame.convert2frame(received_data, self.pmu_cfg2)
                self.logger.debug("[%d] - Received %s from PMU (%s:%d)", self.pdc_id, type(received_message).__name__,
                                  self.pmu_ip, self.pmu_port)
            except FrameError:
                self.logger.warning("[%d] - Received unknown message from PMU (%s:%d)",
                                    self.pdc_id, self.pmu_ip, self.pmu_port)

        return received_message

    def quit(self):
        """
        Close UDP socket
        :return: NoneType
        """
        self.pmu_socket.close()
        self.logger.info("[%d] - UDP socket closed for PMU (%s:%d)", self.pdc_id, self.pmu_ip, self.pmu_port)

class PdcError(BaseException):
    pass