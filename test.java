import java.time.OffsetDateTime;
public class test {
    public static void main(String[] args) {
        OffsetDateTime dt = OffsetDateTime.parse("2026-07-02T19:00:00-05:00");
        System.out.println(dt);
        System.out.println(dt.toLocalDateTime());
    }
}
