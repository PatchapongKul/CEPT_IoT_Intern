#include <Arduino.h>
// Tutorial : https://youtu.be/mnOzfRFQJIM
// LVGLv9 for the JC4827W543 development board
// Use board "ESP32S3 Dev Module" from esp32 Arduino Core by Espressif (last tested on v3.2.0)
// Do not forget to setup and configure lv_conf.h : https://docs.lvgl.io/master/get-started/platforms/arduino.html

#include <lvgl.h>            // Install "lvgl" with the Library Manager (last tested on v9.2.2)
#include <PINS_JC4827W543.h> // Install "GFX Library for Arduino" with the Library Manager (last tested on v1.5.6)
                             // Install "Dev Device Pins" with the Library Manager (last tested on v0.0.2)
#include "TAMC_GT911.h"      // Install "TAMC_GT911" with the Library Manager (last tested on v1.0.2)

#include "PubSubClient.h"
#include "WiFi.h"
#include "secret.h"
#include <ArduinoJson.h>
#include <time.h>

WiFiClient espClient;
PubSubClient client(espClient);

const char *ntpServer = "pool.ntp.org";
const long gmtOffset_sec = 7 * 3600;
const int daylightOffset_sec = 0;

lv_obj_t *pwsdropdown;
lv_obj_t *fandropdown;
lv_obj_t *modedropdown;

lv_obj_t *time_label;
// Touch Controller
#define TOUCH_SDA 8
#define TOUCH_SCL 4
#define TOUCH_INT 3
#define TOUCH_RST 38
#define TOUCH_WIDTH 480
#define TOUCH_HEIGHT 272
    TAMC_GT911 touchController = TAMC_GT911(TOUCH_SDA, TOUCH_SCL, TOUCH_INT, TOUCH_RST, TOUCH_WIDTH, TOUCH_HEIGHT);

// Display global variables
uint32_t screenWidth;
uint32_t screenHeight;
uint32_t bufSize;
lv_display_t *disp;
lv_color_t *disp_draw_buf;

lv_obj_t *arc;
lv_obj_t *arc_label;
lv_obj_t *btn;
lv_obj_t *btn_label;

unsigned long last_time_update = 0;

int lastLog = 0;
int temp = 25; //initial temperature
int current_temp = 25; // Current temperature, can be updated from MQTT
bool temp_flag = false;

String fanmode = "auto";
String current_fanmode = "auto"; 
bool fanmode_flag = false;

String mode = "auto";
String current_mode = "auto";
bool mode_flag = false;

String powerSelect = "100%";
String current_powerSelect = "100%";
bool powerSelect_flag = false;

String status = "on";
String current_status = "on";
bool status_flag = false;

void setup_time()
{
  Serial.println("Setting up NTP time synchronization...");
  configTime(gmtOffset_sec, daylightOffset_sec, ntpServer);
  time_t now = time(nullptr);
  while (now < 8 * 3600 * 2)
  {
    delay(500);
    Serial.print(".");
    now = time(nullptr);
  }
  Serial.println("\nTime synced.");
  struct tm timeinfo;
  gmtime_r(&now, &timeinfo);
  Serial.printf("Current time (UTC+7): %s", asctime(&timeinfo));
}

void my_print(lv_log_level_t level, const char *buf)
{
  LV_UNUSED(level);
  Serial.println(buf);
  Serial.flush();
}

// LVGL calls this function to retrieve elapsed time
uint32_t millis_cb(void)
{
  return millis();
}

// LVGL calls this function when a rendered image needs to copied to the display
void my_disp_flush(lv_display_t *disp, const lv_area_t *area, uint8_t *px_map)
{
  uint32_t w = lv_area_get_width(area);
  uint32_t h = lv_area_get_height(area);

  gfx->draw16bitRGBBitmap(area->x1, area->y1, (uint16_t *)px_map, w, h);

  lv_disp_flush_ready(disp);
}

void setup_wifi()
{
  Serial.printf("Connecting to %s\n", ssid);
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED)
  {
    delay(1000);
    Serial.print(" Not yet ");
  }
  Serial.println("\nWiFi connected.");
  Serial.print("IP address: ");
  Serial.println(WiFi.localIP());
}

void reconnect_mqtt()
{
  while (!client.connected())
  {
    Serial.print("Attempting MQTT connection...");
    if (client.connect(mqtt_client, mqtt_user, mqtt_pass))
    {
      Serial.println("connected");
      client.subscribe(mqtt_topic);
      client.subscribe("esp01/hvac/tocontrol");
    }
    else
    {
      Serial.print("failed, rc=");
      Serial.print(client.state());
      Serial.println(" trying again in 5 seconds");
      delay(5000);
    }
  }
}

void mqtt_callback(char *topic, byte *payload, unsigned int length)
{
  payload[length] = '\0';
  String msg = String((char *)payload);
 

  if (String(topic) == "esp01/hvac/tocontrol")
  {
    Serial.println("Received HVAC status update");
    ArduinoJson::JsonDocument doc;
    DeserializationError err = deserializeJson(doc, msg);
    if (err)
    {
      // Serial.println("❌ JSON parse failed");
      return;
    }

    if (doc.containsKey("state"))
    {
      Serial.printf("State: %s\n", doc["state"].as<const char *>());
      current_status = doc["state"].as<const char *>();
      lv_label_set_text(btn_label, String("Status: " + current_status).c_str());
      Serial.printf("Status updated to %s\n", current_status.c_str());
    }
    if (doc.containsKey("setpoint"))
    {
      current_temp = doc["setpoint"].as<int>();
      Serial.printf("Setpoint updated to %d°C\n", current_temp);
      lv_arc_set_value(arc, current_temp);
      lv_label_set_text_fmt(arc_label, "%d°C", current_temp);
      lv_obj_align_to(arc_label, arc, LV_ALIGN_CENTER, 0, 0);
    }

    if (doc["mode"].is<const char *>())
    {
      current_mode = doc["mode"].as<const char *>();

      uint16_t index = lv_dropdown_get_option_index(modedropdown, current_mode.c_str());

      
      lv_dropdown_set_selected(modedropdown, index);

      
    }
    
    if (doc["fanMode"].is<const char *>())
    {
      current_fanmode = doc["fanMode"].as<const char *>(); // ปลอดภัย ไม่ต้องกังวลเรื่อง pointer


      uint16_t index = lv_dropdown_get_option_index(fandropdown, current_fanmode.c_str());

      // ตั้งค่า dropdown ให้เลือกอันที่ตรง
      lv_dropdown_set_selected(fandropdown, index);

      Serial.printf("Fan mode updated to %s\n", current_fanmode.c_str());
    }

    
    if (doc["powerSelect"].is<const char *>())
    {
      current_powerSelect = doc["powerSelect"].as<const char *>();
      Serial.printf("Power Select updated to %s\n", current_powerSelect.c_str());
    
      // // Update the dropdown selection
      uint16_t index = lv_dropdown_get_option_index(pwsdropdown, current_powerSelect.c_str());
      
      lv_dropdown_set_selected(pwsdropdown, index);
    }
  } 
}

// LVGL calls this function to read the touchpad
void my_touchpad_read(lv_indev_t *indev, lv_indev_data_t *data)
{
  // Update the touch data from the GT911 touch controller
  touchController.read();

  // If a touch is detected, update the LVGL data structure with the first point's coordinates.
  if (touchController.isTouched && touchController.touches > 0)
  {
    data->point.x = touchController.points[0].x;
    data->point.y = touchController.points[0].y;
    data->state = LV_INDEV_STATE_PRESSED; // Touch is pressed
  }
  else
  {
    data->state = LV_INDEV_STATE_RELEASED; // No touch detected
  }
}
void set_status(){
  if (current_status != status && status_flag) {
      String payload = "{";
      payload += "\"status\": \"" + String(status) + "\"";
      payload += "}";
      client.publish(mqtt_topic, payload.c_str());
      status_flag = false;
}
}
void set_temp()
{
  if ( current_temp != temp && temp_flag) {
      String payload = "{";
      payload += "\"setpoint\": " + String(temp);
      payload += "}";
      client.publish(mqtt_topic, payload.c_str());
      temp_flag = false;
  }
}
void set_fanmode()
{
  if ( current_fanmode != fanmode && fanmode_flag) {
      String payload = "{";
      payload += "\"fanMode\": \"" + String(fanmode) + "\"";
      payload += "}";
      client.publish(mqtt_topic, payload.c_str());
      fanmode_flag = false;
  }
}
void set_mode()
{
  if ( current_mode != mode && mode_flag) {
      String payload = "{";
      payload += "\"mode\": \"" + String(mode) + "\"";
      payload += "}";
      client.publish(mqtt_topic, payload.c_str());
      mode_flag = false;
  }
}
void set_powerSelect()
{
  if ( current_powerSelect != powerSelect && powerSelect_flag) {
      String payload = "{";
      payload += "\"powerSelect\": \"" + String(powerSelect) + "\"";
      payload += "}";
      client.publish(mqtt_topic, payload.c_str());
      powerSelect_flag = false;
  }
}

//Button on off
static void btn_event_cb(lv_event_t *e)
{
  lv_event_code_t code = lv_event_get_code(e);
  btn = (lv_obj_t *)lv_event_get_target(e);
  if (code == LV_EVENT_CLICKED)
  {
    //ตั้งให้มันสลับกันตอนคลิ๊ก
    const char *status[] = {"on" ,"off"};
    static uint8_t cnt = 1;
    
    cnt = !cnt;// toggle 0 / 1
    lv_obj_t *label = lv_obj_get_child(btn, 0);
    lv_label_set_text_fmt(label, "Status: %s", status[cnt]);

    StaticJsonDocument<64> doc;
    doc["state"] = status[cnt];
    char jsonStr[64];
    serializeJson(doc, jsonStr, sizeof(jsonStr));
    client.publish(mqtt_topic, jsonStr);
    
}

}
void update_time_label()
{
  time_t now = time(nullptr);
  struct tm timeinfo;
  localtime_r(&now, &timeinfo); // สำหรับ timezone +7

  char time_str[32];
  strftime(time_str, sizeof(time_str), "%d/%m/%Y %H:%M:%S", &timeinfo);

  lv_label_set_text_fmt(time_label, "Time: %s", time_str);
}

static void value_changed_event_cb(lv_event_t * e)
{
    arc = lv_event_get_target_obj(e);
    arc_label = (lv_obj_t *)lv_event_get_user_data(e);
    int32_t value = lv_arc_get_value(arc);
    lv_label_set_text_fmt(arc_label, "%" LV_PRId32 "°C", lv_arc_get_value(arc));
    // อยู่กลาง arc ตลอด
    lv_obj_align_to(arc_label, arc, LV_ALIGN_CENTER, 0, 0);

    temp = value ; // Update the global temperature variable
    temp_flag = true;
    
    

}
//add
//extern void lv_example_msgbox_2(); // บอกว่าเราจะเรียกใช้ฟังก์ชันจากไฟล์อื่น


//drop down static void
static void drop_down_event_handler_fan(lv_event_t * e)
{
    lv_event_code_t code = lv_event_get_code(e);
    lv_obj_t * obj = lv_event_get_target_obj(e);
    if(code == LV_EVENT_VALUE_CHANGED) {
        char buf[32];
        lv_dropdown_get_selected_str(obj, buf, sizeof(buf));
        Serial.printf("Fan mode selected: %s\n", buf);
        LV_LOG_USER("Option: %s", buf);
        fanmode = String(buf);
        fanmode_flag = true;
    }
}

static void drop_down_event_handler_mode(lv_event_t *e)
{
  lv_event_code_t code = lv_event_get_code(e);
  lv_obj_t *obj = lv_event_get_target_obj(e);
  if (code == LV_EVENT_VALUE_CHANGED)
  {
    char buf[32];
    lv_dropdown_get_selected_str(obj, buf, sizeof(buf));
    Serial.printf("Mode selected: %s\n", buf);
    LV_LOG_USER("Option: %s", buf);
    mode = String(buf);
    mode_flag = true;
  }
}

void drop_down_event_handler_power(lv_event_t *e)
{
    lv_event_code_t code = lv_event_get_code(e);
    lv_obj_t * obj = lv_event_get_target_obj(e);
    if(code == LV_EVENT_VALUE_CHANGED) {
        char buf[32];
        lv_dropdown_get_selected_str(obj, buf, sizeof(buf));
        Serial.printf("Power Select: %s\n", buf);
        LV_LOG_USER("Option: %s", buf);
        powerSelect = String(buf);
        powerSelect_flag = true;
    }
}
//switch
static void switch_event_handler(lv_event_t * e)
{
    lv_event_code_t code = lv_event_get_code(e);
    lv_obj_t * obj = lv_event_get_target_obj(e);
    if(code == LV_EVENT_VALUE_CHANGED) {
        LV_UNUSED(obj);
        LV_LOG_USER("State: %s\n", lv_obj_has_state(obj, LV_STATE_CHECKED) ? "On" : "Off");
    }
}


void setup()
{
  Serial.begin(115200);
  setup_wifi();
  setup_time();
  client.setServer(mqtt_server, mqtt_port);
  reconnect_mqtt();
  client.setCallback(mqtt_callback);
  Serial.println("Arduino_GFX LVGL_Arduino_v9 example ");
  String LVGL_Arduino = String('V') + lv_version_major() + "." + lv_version_minor() + "." + lv_version_patch();
  Serial.println(LVGL_Arduino);

  // Init Display
  if (!gfx->begin())
  {
    Serial.println("gfx->begin() failed!");
    while (true)
    {
      /* no need to continue */
    }
  }
  // Set the backlight of the screen to High intensity
  pinMode(GFX_BL, OUTPUT);
  digitalWrite(GFX_BL, HIGH);
  gfx->fillScreen(RGB565_BLACK);
  gfx->setRotation(2);

  // Init touch device
  touchController.begin();
  touchController.setRotation(ROTATION_NORMAL); // Change as needed

  // init LVGL
  lv_init();

  // Set a tick source so that LVGL will know how much time elapsed
  lv_tick_set_cb(millis_cb);

  // register print function for debugging
#if LV_USE_LOG != 0
  lv_log_register_print_cb(my_print);
#endif

  screenWidth = gfx->width();
  screenHeight = gfx->height();
  bufSize = screenWidth * 40;

  disp_draw_buf = (lv_color_t *)heap_caps_malloc(bufSize * 2, MALLOC_CAP_INTERNAL | MALLOC_CAP_8BIT);
  if (!disp_draw_buf)
  {
    // remove MALLOC_CAP_INTERNAL flag try again
    disp_draw_buf = (lv_color_t *)heap_caps_malloc(bufSize * 2, MALLOC_CAP_8BIT);
  }
  if (!disp_draw_buf)
  {
    Serial.println("LVGL disp_draw_buf allocate failed!");
    while (true)
    {
      /* no need to continue */
    }
  }
  else
  {
    disp = lv_display_create(screenWidth, screenHeight);
    lv_display_set_flush_cb(disp, my_disp_flush);
    lv_display_set_buffers(disp, disp_draw_buf, NULL, bufSize * 2, LV_DISPLAY_RENDER_MODE_PARTIAL);

    // Create input device (touchpad of the JC4827W543)
    lv_indev_t *indev = lv_indev_create();
    lv_indev_set_type(indev, LV_INDEV_TYPE_POINTER);
    lv_indev_set_read_cb(indev, my_touchpad_read);

    // // Create some widgets to see if everything is working
    // lv_obj_t *title_label = lv_label_create(lv_screen_active());
    // lv_label_set_text(title_label, "Hello Arduino2505chula, I'm LVGL!(V" GFX_STR(LVGL_VERSION_MAJOR) "." GFX_STR(LVGL_VERSION_MINOR) "." GFX_STR(LVGL_VERSION_PATCH) ")");
    // lv_obj_align(title_label, LV_ALIGN_BOTTOM_MID, 0, 0);

    //button Widget switch on/off
    btn = lv_button_create(lv_screen_active());       /*Add a button to the current screen*/
    lv_obj_set_pos(btn, 10, 10);                                /*Set its position*/
    lv_obj_set_size(btn, 120, 50);                              /*Set its size*/
    lv_obj_add_event_cb(btn, btn_event_cb, LV_EVENT_ALL, NULL); /*Assign a callback to the button*/

    btn_label = lv_label_create(btn); /*Add a label to the button*/
    lv_label_set_text(btn_label, "Status: on");     /*Set อันแรกเป็น on*/
    lv_obj_center(btn_label);

    //Arc Widget
    // สร้าง label และ arc
    arc = lv_arc_create(lv_screen_active());
    lv_obj_set_size(arc, 150, 150);
    lv_arc_set_rotation(arc, 135);
    lv_arc_set_bg_angles(arc, 0, 270);

    lv_arc_set_range(arc, 19, 31); //ตั้ง range
    lv_arc_set_value(arc, 20);
    lv_obj_center(arc);  // เอา arc ไปไว้กลางจอ

    // สร้าง label แล้วจัดให้อยู่กลาง arc
    arc_label = lv_label_create(lv_screen_active());
    lv_label_set_text(arc_label, "20°C");  // ค่าเริ่มต้น
    lv_obj_align_to(arc_label, arc, LV_ALIGN_CENTER, 0, 0);  // จัดให้อยู่กลาง arc

    // ทำให้ label เปลี่ยนค่าตาม arc
    lv_obj_add_event_cb(arc, value_changed_event_cb, LV_EVENT_VALUE_CHANGED, arc_label);
    
    //Mode AC container
    //Container (แนว Row) รวม Label + Dropdown
    // lv_obj_t *row = lv_obj_create(lv_screen_active());
    // lv_obj_set_size(row, LV_SIZE_CONTENT, LV_SIZE_CONTENT);
    // lv_obj_set_flex_flow(row, LV_FLEX_FLOW_ROW);
    // lv_obj_set_style_pad_row(row, 10, 0);  // ระยะห่างระหว่าง label กับ dropdown

    //Mode Dropdown 
    lv_obj_t *mode_label = lv_label_create(lv_screen_active()); //Label "Mode:"
    lv_label_set_text(mode_label, "Mode :");
    lv_obj_align(mode_label, LV_ALIGN_TOP_RIGHT, -120, 20);  // ชิดขอบขวา

    modedropdown = lv_dropdown_create(lv_screen_active()); //Mode Dropdown Widget
    lv_dropdown_set_options_static(modedropdown,
        "auto\n"
        "cool\n"
        "dry\n"
        "fan_only");

    lv_obj_set_width(modedropdown, 100);
    lv_obj_align(modedropdown, LV_ALIGN_TOP_RIGHT, -10, 10);  // วางด้านขวาสุด
    lv_obj_add_event_cb(modedropdown, drop_down_event_handler_mode , LV_EVENT_ALL, NULL);

    //Fan Mode Dropdown 
    //สร้าง container
    lv_obj_t *ctn1 = lv_obj_create(lv_screen_active());
    lv_obj_set_size(ctn1, LV_SIZE_CONTENT, LV_SIZE_CONTENT); 
    lv_obj_align(ctn1, LV_ALIGN_LEFT_MID, 10, 0); // วางไว้ขวากลาง
    lv_obj_set_layout(ctn1, LV_LAYOUT_FLEX);
    lv_obj_set_flex_flow(ctn1, LV_FLEX_FLOW_COLUMN);

    lv_obj_t *fanmode_label = lv_label_create(ctn1); //Fan mode label
    lv_label_set_text(fanmode_label, "Fan Mode :");
    lv_obj_align(fanmode_label, LV_ALIGN_LEFT_MID, 10, 0);  

    fandropdown = lv_dropdown_create(ctn1);  //Fan mode Dropdown Wiget
    lv_dropdown_set_options_static(fandropdown,
        "quiet\n"
        "lvl_1\n"
        "lvl_2\n"
        "lvl_3\n"
        "lvl_4\n" 
        "lvl_5\n"
        "auto\n");

    lv_obj_set_width(fandropdown, 100);
    lv_obj_align(fandropdown, LV_ALIGN_LEFT_MID, 10, -10);  // วางด้านซ้ายกลาง
    lv_obj_add_event_cb(fandropdown, drop_down_event_handler_fan, LV_EVENT_ALL, NULL);
    
    //power select
    //สร้าง container
    lv_obj_t *ctn2 = lv_obj_create(lv_screen_active());
    lv_obj_set_size(ctn2, LV_SIZE_CONTENT, LV_SIZE_CONTENT); 
    lv_obj_align(ctn2, LV_ALIGN_RIGHT_MID, -10, 0); // วางไว้ขวากลาง
    lv_obj_set_layout(ctn2, LV_LAYOUT_FLEX);
    lv_obj_set_flex_flow(ctn2, LV_FLEX_FLOW_COLUMN);

    lv_obj_t *pws_label = lv_label_create(ctn2); //Fan mode label
    lv_label_set_text(pws_label, "Power Select :");
    lv_obj_align(pws_label, LV_ALIGN_RIGHT_MID, -10, 0);  

    pwsdropdown = lv_dropdown_create(ctn2);  //Fan mode Dropdown Wiget
    lv_dropdown_set_options_static(pwsdropdown,
        "50%\n"
        "75%\n"
        "100%");

    lv_obj_set_width(pwsdropdown, 100);
    lv_obj_align(pwsdropdown, LV_ALIGN_RIGHT_MID, -10, 0);  // วางด้านซ้ายกลาง
    lv_obj_add_event_cb(pwsdropdown, drop_down_event_handler_power, LV_EVENT_ALL, NULL);

    //Pure ไม่ได้ใช้
    //สร้าง container
    // lv_obj_t *ctn0 = lv_obj_create(lv_screen_active());
    // lv_obj_set_size(ctn0, LV_SIZE_CONTENT, LV_SIZE_CONTENT); 
    // lv_obj_align(ctn0, LV_ALIGN_RIGHT_MID, -30, 0); // วางไว้ขวากลาง
    // lv_obj_set_layout(ctn0, LV_LAYOUT_FLEX);
    // lv_obj_set_flex_flow(ctn0, LV_FLEX_FLOW_COLUMN);
    
    // lv_obj_t *pure_label = lv_label_create(ctn0); //Label "Pure":"
    // lv_label_set_text(pure_label, "Pure :");

    // lv_obj_t *sw;
    // sw = lv_switch_create(ctn0);
    // lv_obj_add_event_cb(sw, switch_event_handler, LV_EVENT_ALL, NULL);
    // lv_obj_add_flag(sw, LV_OBJ_FLAG_EVENT_BUBBLE);



    /* footer */
    // สร้าง container แบบ row ด้านล่าง
    lv_obj_t *footer = lv_obj_create(lv_screen_active());
    lv_obj_set_size(footer, screenWidth, 60);
    lv_obj_align(footer, LV_ALIGN_BOTTOM_MID, 0, 0);
    lv_obj_set_flex_flow(footer, LV_FLEX_FLOW_ROW);
    lv_obj_set_flex_align(footer, LV_FLEX_ALIGN_CENTER, LV_FLEX_ALIGN_CENTER, LV_FLEX_ALIGN_CENTER); // จัดกลางทั้งแนวนอนแนวตั้ง
    lv_obj_set_style_pad_column(footer, 20, 0); // ระยะห่างระหว่างปุ่ม
    lv_obj_set_style_pad_row(footer, 10, 0);
    lv_obj_set_style_pad_all(footer, 10, 0);

    time_label = lv_label_create(footer);
    lv_label_set_text(time_label, "Time: --:--:--");
    lv_obj_align(time_label, LV_ALIGN_CENTER, 0, 0);

    // // ปุ่ม Apply
    // lv_obj_t *apply_btn = lv_button_create(footer);
    // lv_obj_set_size(apply_btn, 100, 40);
    // lv_obj_t *apply_lbl = lv_label_create(apply_btn);
    // lv_label_set_text(apply_lbl, "Apply");
    // lv_obj_center(apply_lbl);

    // // ปุ่ม reset 
    // lv_obj_t *cancel_btn = lv_button_create(footer);
    // lv_obj_set_size(cancel_btn, 100, 40);
    // lv_obj_t *cancel_lbl = lv_label_create(cancel_btn);
    // lv_label_set_text(cancel_lbl, "Reset");
    // lv_obj_center(cancel_lbl);


    //msg_box
    //lv_example_msgbox_2(); 
  
    // Manually update the label for the first time
    //lv_obj_send_event(arc, LV_EVENT_VALUE_CHANGED, NULL);    
  }

  Serial.println("Setup done");
}

void loop()
{
  lv_task_handler(); /* let the GUI do its work */
  reconnect_mqtt();
  client.loop();
  if (millis() - lastLog > 1000)
  {
    set_status();

    set_temp();
    
    set_fanmode();

    set_mode();

    set_powerSelect();
    
    lastLog = millis();
  }
  if (millis() - last_time_update > 1000)
  {
    update_time_label();
    last_time_update = millis();
  }

#ifdef DIRECT_MODE
#if defined(CANVAS) || defined(RGB_PANEL) || defined(DSI_PANEL)
      gfx->flush();
#else  // !(defined(CANVAS) || defined(RGB_PANEL) || defined(DSI_PANEL))
      gfx->draw16bitRGBBitmap(0, 0, (uint16_t *)disp_draw_buf, screenWidth, screenHeight);
#endif // !(defined(CANVAS) || defined(RGB_PANEL) || defined(DSI_PANEL))
#else  // !DIRECT_MODE
#ifdef CANVAS
      gfx->flush();
#endif
#endif // !DIRECT_MODE
  
  delay(5);
  }